import { EMAIL_EXTRACT_REGEX } from '../constants/base';

export function getMentionedEmails(str: string): string[] {
  const mentionedEmails: string[] = [];
  let match;
  while ((match = EMAIL_EXTRACT_REGEX.exec(str)) !== null) {
    mentionedEmails.push(match[1]);
  }

  return mentionedEmails;
}
