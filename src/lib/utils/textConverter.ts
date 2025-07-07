import { marked } from "marked";

// Convert markdown to HTML with proper rendering
export const markdownify = (content: string): string => {
  return marked(content) as string;
};

// Convert markdown to plain text (remove HTML tags)
export const plainify = (content: string): string => {
  const markdown = markdownify(content);
  return markdown.replace(/<[^>]*>/g, "");
};

// Humanize string (convert slugs to readable text)
export const humanize = (content: string): string => {
  return content
    .replace(/^[\s_]+|[\s_]+$/g, "")
    .replace(/[_\s]+/g, " ")
    .replace(/^[a-z]/, (m) => m.toUpperCase());
};

// Slugify string (convert to URL-friendly format)
export const slugify = (content: string): string => {
  return content
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};