// @ts-ignore
import _config from '../../fuwari.config.yml';

interface FuwariConfig {
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

const config: FuwariConfig = _config;

export const getConfig = () => config;