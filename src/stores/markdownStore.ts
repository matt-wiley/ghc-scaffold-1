// src/stores/markdownStore.ts
import { writable, derived } from 'svelte/store';

interface MarkdownFiles {
  [filename: string]: string;
}

// Create a writable store to hold the markdown content
const markdownStore = writable<MarkdownFiles>({});

// Function to load a markdown file and update the store
const loadMarkdown = async (filename: string) => {
  try {
    const response = await fetch(`/${filename}`);
    if (response.ok) {
      const content = await response.text();
      markdownStore.update((files) => ({ ...files, [filename]: content }));
    } else {
      console.error(`Failed to load ${filename}`);
    }
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
  }
};

const markdownResponses = derived(markdownStore, ($markdownStore) => Object.values($markdownStore));

// Export the store and the load function
export { markdownStore, markdownResponses, loadMarkdown };
