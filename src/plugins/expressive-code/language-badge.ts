/**
 * Based on the discussion at https://github.com/expressive-code/expressive-code/issues/153#issuecomment-2282218684
 */
import { definePlugin } from '@expressive-code/core'

export function pluginLanguageBadge() {
  return definePlugin({
    name: 'Language Badge',
    baseStyles: ({ cssVar }) => `
      [data-language]::before {
        position: absolute;
        z-index: 2;
        right: calc(${cssVar('borderWidth')} + ${cssVar('uiPaddingInline')} / 2);
        top: calc(${cssVar('borderWidth')} + 0.35rem);
        padding: 0.1rem 0.5rem;
        box-shadow: 0 0 1px 1px ${cssVar('codeBackground')};
        content: attr(data-language);
        font-size: 0.75rem;
        text-transform: uppercase;
        color: var(--btn-content);
        background: var(--btn-regular-bg);
        border-radius: ${cssVar('borderRadius')};
        pointer-events: none;
        transition: opacity 0.2s;
        opacity: 0;
      }
      .frame:not(.has-title):not(.is-terminal) {
        @media (hover: none) {
          & [data-language]::before {
            opacity: 1;
            margin-right: 3rem;
          }
          & [data-language]:active::before {
            opacity: 0;
          }
        }
        @media (hover: hover) {
          & [data-language]::before {
            opacity: 1;
          }
          &:hover [data-language]::before {
            opacity: 0;
          }
        }
      }
    `,
  })
}
