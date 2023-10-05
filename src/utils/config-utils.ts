// @ts-ignore
import _config from '../../vivia.config.yml';

interface ViviaConfig {
    title: string;
    menu: {
        [key: string]: string;
    };
    lang: string;
    appearance: {
        hue: number;
    };
    favicon: string;
    banner: {
        enable: boolean;
        url: string;
        position: string;
        onAllPages: boolean;
    };
    sidebar: {
        widgets: {
            normal: string | string[];
            sticky: string | string[];
        };
    };
    profile: {
        avatar: string;
        author: string;
        subtitle: string;
        links: {
            name: string;
            icon: string;
            url: string;
        }[];
    }
}

const config: ViviaConfig = _config;

export const getConfig = () => config;