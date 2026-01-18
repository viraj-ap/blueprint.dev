
import type { Session } from '../types';

export const convertSessionToMarkdown = (session: Session): string => {
    // If the session has raw markdown content, return it directly
    if (session.content && session.content.trim()) {
        return session.content;
    }

    let md = `# ${session.projectTitle}\n\n`;

    // Add Metadata/Context if useful
    md += `> Session ID: ${session.sessionId}\n`;
    md += `> Created: ${new Date(session.createdAt).toLocaleDateString()}\n\n`;

    session.steps.forEach((step, index) => {
        md += `## ${index + 1}. ${step.title}\n\n`;
        md += `${step.description}\n\n`;

        if (step.techStack.length > 0) {
            md += `**Tech Stack:** ${step.techStack.join(', ')}\n\n`;
        }

        md += `---\n\n`;
    });

    return md;
};
