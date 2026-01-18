
import { useEffect, useCallback } from 'react';
import { type Annotation, AnnotationType } from '../types';

export const useHighlighter = (
    containerRef: React.RefObject<HTMLElement | null>, // allow null in ref object
    annotations: Annotation[],
    onSelectAnnotation?: (id: string) => void
) => {
    // Helper to find text in DOM and create a range
    const findTextInDOM = useCallback((searchText: string): Range | null => {
        if (!containerRef.current) return null;

        const walker = document.createTreeWalker(
            containerRef.current,
            NodeFilter.SHOW_TEXT,
            null
        );

        let node: Text | null;
        while ((node = walker.nextNode() as Text | null)) {
            const text = node.textContent || '';
            const index = text.indexOf(searchText);
            if (index !== -1) {
                const range = document.createRange();
                range.setStart(node, index);
                range.setEnd(node, index + searchText.length);
                return range;
            }
        }

        // Try across multiple text nodes for multi-line content
        const fullText = containerRef.current.textContent || '';
        const searchIndex = fullText.indexOf(searchText);
        if (searchIndex === -1) return null;

        // Reset walker
        const walker2 = document.createTreeWalker(
            containerRef.current,
            NodeFilter.SHOW_TEXT,
            null
        );

        let charCount = 0;
        let startNode: Text | null = null;
        let startOffset = 0;
        let endNode: Text | null = null;
        let endOffset = 0;

        while ((node = walker2.nextNode() as Text | null)) {
            const nodeLength = node.textContent?.length || 0;

            if (!startNode && charCount + nodeLength > searchIndex) {
                startNode = node;
                startOffset = searchIndex - charCount;
            }

            if (startNode && charCount + nodeLength >= searchIndex + searchText.length) {
                endNode = node;
                endOffset = searchIndex + searchText.length - charCount;
                break;
            }

            charCount += nodeLength;
        }

        if (startNode && endNode) {
            const range = document.createRange();
            range.setStart(startNode, startOffset);
            range.setEnd(endNode, endOffset);
            return range;
        }

        return null;
    }, [containerRef]);

    const renderAnnotations = useCallback(() => {
        if (!containerRef.current || annotations.length === 0) return;

        // First, clear existing manual highlights to avoid duplications if re-running
        // Note: This is a simple clear. In a real app we might want to be more selective or use a virtual overlay.
        // For this port, we'll try to rely on the fact that we modify the DOM. 
        // BUT resetting the DOM modification is hard without a full re-render of the content (ReactMarkdown).
        // A better approach for this "manual" highlighter is to only apply NEW highlights or clear everything if we could.
        // Since ReactMarkdown re-renders the whole content when markdown changes, highlights are naturally cleared then.
        // But if only annotations change, we might pile up wrappers. 
        // Let's implement a 'clear' by looking for our class.
        const existing = containerRef.current.querySelectorAll('.annotation-highlight');
        existing.forEach(el => {
            const parent = el.parentNode;
            while (el.firstChild) {
                parent?.insertBefore(el.firstChild, el);
            }
            parent?.removeChild(el);
        });


        annotations.forEach(ann => {
            // Find the text in the DOM
            const range = findTextInDOM(ann.originalText);
            if (!range) return;

            try {
                // Multi-mark approach: wrap each text node portion separately
                const textNodes: { node: Text; start: number; end: number }[] = [];

                // Collect all text nodes within the range
                const walker = document.createTreeWalker(
                    range.commonAncestorContainer.nodeType === Node.TEXT_NODE
                        ? range.commonAncestorContainer.parentNode!
                        : range.commonAncestorContainer,
                    NodeFilter.SHOW_TEXT,
                    null
                );

                let node: Text | null;
                let inRange = false;

                while ((node = walker.nextNode() as Text | null)) {
                    // Check if this node is the start container
                    if (node === range.startContainer) {
                        inRange = true;
                        const start = range.startOffset;
                        const end = node === range.endContainer ? range.endOffset : node.length;
                        if (end > start) {
                            textNodes.push({ node, start, end });
                        }
                        if (node === range.endContainer) break;
                        continue;
                    }

                    // Check if this node is the end container
                    if (node === range.endContainer) {
                        if (inRange) {
                            const end = range.endOffset;
                            if (end > 0) {
                                textNodes.push({ node, start: 0, end });
                            }
                        }
                        break;
                    }

                    // Node is fully within range
                    if (inRange && node.length > 0) {
                        textNodes.push({ node, start: 0, end: node.length });
                    }
                }

                if (textNodes.length === 0 && range.startContainer === range.endContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
                    // Single node case fallback if walker missed it (unlikely but safe)
                    textNodes.push({
                        node: range.startContainer as Text,
                        start: range.startOffset,
                        end: range.endOffset
                    });
                }


                // Wrap each text node portion
                textNodes.reverse().forEach(({ node, start, end }) => {
                    try {
                        const nodeRange = document.createRange();
                        nodeRange.setStart(node, start);
                        nodeRange.setEnd(node, end);

                        const mark = document.createElement('mark');
                        mark.className = 'annotation-highlight';
                        mark.dataset.bindId = ann.id;

                        if (ann.type === AnnotationType.DELETION) {
                            mark.classList.add('deletion');
                        } else if (ann.type === AnnotationType.COMMENT) {
                            mark.classList.add('comment');
                        }

                        // Apply custom color if present (for AI components)
                        if (ann.color) {
                            mark.style.backgroundColor = ann.color;
                            mark.style.color = '#000'; // Ensure readability
                        }

                        nodeRange.surroundContents(mark);

                        mark.addEventListener('click', (e) => {
                            e.stopPropagation();
                            if (onSelectAnnotation) onSelectAnnotation(ann.id);
                        });
                    } catch (e) {
                        console.warn(`Failed to wrap text node for annotation ${ann.id}`, e);
                    }
                });

            } catch (e) {
                console.warn(`Failed to apply highlight for annotation ${ann.id}`, e);
            }
        });

    }, [annotations, findTextInDOM, onSelectAnnotation, containerRef]);

    // Apply highlights whenever annotations or content (ref) changes
    useEffect(() => {
        // We need a slight delay to ensure ReactMarkdown has finished rendering if it just changed
        const timer = setTimeout(() => {
            renderAnnotations();
        }, 100);
        return () => clearTimeout(timer);
    }, [renderAnnotations]);

    return { renderAnnotations };
};
