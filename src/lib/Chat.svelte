<script lang="ts">
    import { onMount, afterUpdate, onDestroy } from "svelte";
    import { marked } from "marked";
    import DOMPurify from "dompurify";
    import hljs from 'highlight.js/lib/core';
    import 'highlight.js/styles/default.css';

    // Import all Highlight.js languages
    import javascript from 'highlight.js/lib/languages/javascript';
    import python from 'highlight.js/lib/languages/python';
    import cpp from 'highlight.js/lib/languages/cpp';
    import java from 'highlight.js/lib/languages/java';
    import ruby from 'highlight.js/lib/languages/ruby';
    import go from 'highlight.js/lib/languages/go';
    import rust from 'highlight.js/lib/languages/rust';
    import typescript from 'highlight.js/lib/languages/typescript';
    import csharp from 'highlight.js/lib/languages/csharp';
    import php from 'highlight.js/lib/languages/php';
    import swift from 'highlight.js/lib/languages/swift';
    import kotlin from 'highlight.js/lib/languages/kotlin';
    import scala from 'highlight.js/lib/languages/scala';
    import haskell from 'highlight.js/lib/languages/haskell';
    import sql from 'highlight.js/lib/languages/sql';
    import html from 'highlight.js/lib/languages/xml';
    import css from 'highlight.js/lib/languages/css';
    import bash from 'highlight.js/lib/languages/bash';
    import json from 'highlight.js/lib/languages/json';
    import yaml from 'highlight.js/lib/languages/yaml';
    import markdown from 'highlight.js/lib/languages/markdown';
    import plaintext from 'highlight.js/lib/languages/plaintext';



    let messages: any[] = [];
    let inputValue = "";
    let chatContainer: HTMLElement;
    let isWaiting = false;
    let currentStreamingMessage = "";
    let isNearBottom = true;
    let scrollThreshold = 100; // pixels from bottom to consider "near bottom"

    $: formattedMessages = messages.map((msg) => ({
        ...msg,
        content: msg.type === 'bot' ? renderBotMessage(msg.content) : DOMPurify.sanitize(marked(msg.content)),
    }));

    function renderBotMessage(content: string) {
        const renderer = new marked.Renderer();
        renderer.code = (code, language) => {
            let lang = language || 'plaintext';
            if (typeof code === 'object' && code.lang) {
                lang = code.lang;
                code = code.text;
            }

            if (typeof code !== 'string') {
                console.error('Invalid code type:', typeof code, code);
                return `<pre><code>Error: Invalid code type</code></pre>`;
            }

            let highlightedCode;
            try {
                const validLanguage = hljs.getLanguage(lang) ? lang : 'plaintext';
                highlightedCode = hljs.highlight(code, { language: validLanguage }).value;
            } catch (error) {
                console.error('Highlight.js error:', error);
                highlightedCode = hljs.highlightAuto(code).value;
            }

            return `<pre><code class="hljs ${lang}">${highlightedCode}</code></pre>`;
        };

        try {
            const html = marked.parse(content, { renderer });
            return DOMPurify.sanitize(html);
        } catch (error) {
            console.error('Marked parsing error:', error);
            return `<p>Error rendering message: ${error.message}</p>`;
        }
    }

    function handleSubmit() {
        if (inputValue.trim()) {
            messages = [...messages, { type: "user", content: inputValue }];
            inputValue = "";
            isWaiting = true;
            simulateBotResponse();
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSubmit();
        }
    }

    function simulateBotResponse() {
        const responses = [
            "Here's an example of Python code:\n\n```python\ndef fibonacci(n):\n    a, b = 0, 1\n    for _ in range(n):\n        yield a\n        a, b = b, a + b\n\nfor num in fibonacci(10):\n    print(num)\n```\n\nAnd here's some JavaScript:\n\n```javascript\nconst fibonacci = function* (n) {\n    let [a, b] = [0, 1];\n    for (let i = 0; i < n; i++) {\n        yield a;\n        [a, b] = [b, a + b];\n    }\n};\n\nfor (const num of fibonacci(10)) {\n    console.log(num);\n}\n```",
        ];
        const response = responses[Math.floor(Math.random() * responses.length)];
        const words = response.split(" ");

        messages = [...messages, { type: "bot", content: "" }];
        let currentIndex = 0;

        function typeWord() {
            const speedModifier = (words.length - currentIndex) / words.length;
            if (currentIndex < words.length) {
                currentStreamingMessage += words[currentIndex] + " ";
                messages = messages.map((msg, index) =>
                    index === messages.length - 1
                        ? { ...msg, content: currentStreamingMessage.trim() }
                        : msg
                );
                currentIndex++;

                const delay = Math.random() * (80 + 20) * speedModifier;
                setTimeout(typeWord, delay);
            } else {
                isWaiting = false;
                currentStreamingMessage = "";
            }
        }

        setTimeout(typeWord, 500);
    }

    function autoResizeTextarea(e: Event) {
        const target = e.target as HTMLTextAreaElement;
        target.style.height = "auto";
        target.style.height = target.scrollHeight + "px";
    }

    function checkNearBottom() {
        if (chatContainer) {
            const { scrollTop, scrollHeight, clientHeight } = chatContainer;
            isNearBottom = scrollHeight - scrollTop - clientHeight < scrollThreshold;
        }
    }

    function scrollToBottom() {
        if (chatContainer && isNearBottom) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    onMount(() => {
        // Register all imported languages
        hljs.registerLanguage('javascript', javascript);
        hljs.registerLanguage('python', python);
        hljs.registerLanguage('cpp', cpp);
        hljs.registerLanguage('java', java);
        hljs.registerLanguage('ruby', ruby);
        hljs.registerLanguage('go', go);
        hljs.registerLanguage('rust', rust);
        hljs.registerLanguage('typescript', typescript);
        hljs.registerLanguage('csharp', csharp);
        hljs.registerLanguage('php', php);
        hljs.registerLanguage('swift', swift);
        hljs.registerLanguage('kotlin', kotlin);
        hljs.registerLanguage('scala', scala);
        hljs.registerLanguage('haskell', haskell);
        hljs.registerLanguage('sql', sql);
        hljs.registerLanguage('html', html);
        hljs.registerLanguage('css', css);
        hljs.registerLanguage('bash', bash);
        hljs.registerLanguage('json', json);
        hljs.registerLanguage('yaml', yaml);
        hljs.registerLanguage('markdown', markdown);
        hljs.registerLanguage('plaintext', plaintext);

        if (chatContainer) {
            chatContainer.addEventListener('scroll', checkNearBottom);
        }
    });

    afterUpdate(() => {
        scrollToBottom();
    });

    // Clean up the event listener when the component is destroyed
    onDestroy(() => {
        if (chatContainer) {
            chatContainer.removeEventListener('scroll', checkNearBottom);
        }
    });
</script>

<div class="chat-interface">
    <div class="chat-container" bind:this={chatContainer}>
        {#each formattedMessages as message}
            <div class="message {message.type}">
                {@html message.content}
            </div>
        {/each}
        {#if isWaiting}
            <div class="message bot">
                <span class="typing-indicator"></span>
            </div>
        {/if}
    </div>

    <form on:submit|preventDefault={handleSubmit}>
        <textarea
            bind:value={inputValue}
            on:input={autoResizeTextarea}
            on:keydown={handleKeydown}
            placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
            rows="1"
        ></textarea>
        <button type="submit">Send</button>
    </form>
</div>

<style>
    .chat-interface {
        width: 100%;
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .chat-container {
        flex-grow: 1;
        width: 100%;
        overflow-y: auto;
        padding: 1rem;
        border: 1px solid var(--secondary-color);
        background-color: var(--background-color);
    }

    form {
        display: flex;
        width: 100%;
        padding: 1rem;
        background-color: var(--background-color);
        border-top: 1px solid var(--secondary-color);
    }

    textarea {
        flex-grow: 1;
        padding: 0.5rem;
        border: 1px solid var(--secondary-color);
        border-radius: 0.25rem;
        resize: none;
        font-family: inherit;
        margin-right: 0.5rem;
    }

    button {
        background-color: var(--primary-color);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        cursor: pointer;
    }

    .message {
        margin-bottom: 1rem;
        padding: 0.5rem 1rem;
        border-radius: 1rem;
        max-width: 80%;
    }

    .user {
        background-color: var(--primary-color);
        color: white;
        align-self: flex-end;
        margin-left: auto;
        text-align: right;
    }

    .bot {
        background-color: var(--secondary-color);
        color: white;
        text-align: left;
    }

    .typing-indicator {
        display: inline-block;
        border-radius: 1rem;
        padding: 0.5rem 1rem;
        max-width: 10%;
        background-color: var(--secondary-color);
        color: white;
    }

    .typing-indicator::after {
        content: "...";
        animation: ellipsis 1.5s infinite;
    }

    @keyframes ellipsis {
        0% { content: "."; }
        33% { content: ".."; }
        66% { content: "..."; }
    }

    :global(:root) {
        --primary-color: #007bff;
        --secondary-color: #6c757d;
        --background-color: #f8f9fa;
        --text-color: #343a40;
    }

    :global(body) {
        font-family: "Roboto", sans-serif;
        color: var(--text-color);
        background-color: var(--background-color);
    }

    :global(pre) {
        background-color: #f4f4f4;
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
    }

    :global(code) {
        font-family: 'Courier New', Courier, monospace;
    }
</style>