import { Options } from './index.js';
export declare class Announcer {
    id: string;
    style: string;
    region: HTMLElement;
    constructor();
    getRegion(): HTMLElement | null;
    createRegion(): HTMLElement;
    announce(message: string, delay?: number): Promise<void>;
}
export type PageAnnouncementOptions = Pick<Options, 'headingSelector' | 'announcements'>;
export declare function getPageAnnouncement({ headingSelector, announcements }: PageAnnouncementOptions): string | undefined;
