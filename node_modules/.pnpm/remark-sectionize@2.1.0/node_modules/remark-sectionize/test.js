import test from 'tape';
import { u } from 'unist-builder'
import { remark } from 'remark'
import dedent from 'dedent'
import { removePosition } from 'unist-util-remove-position'

import sectionize from './index.js'

test('sectionize', function (t) {
  const document = dedent`
    # Heading 1

    Some text under heading 1.

    ## Heading 1.1

    Additional text.

    ## Heading 1.2

    _More_ additional text.

    ### Heading 1.2.1

    > Blockquote

    Text.

    ##### Bad heading

    Lorem ipsum.

    ### Heading 1.2.2

    Dolor sit amet.

    # Heading 2

    Another top level heading.

    ###### Another bad heading

    When will it end?
  `

  const expected = u('root', {}, [
    u('section', { depth: 1, data: { hName: 'section' } }, [
      u('heading', { depth: 1 }, [u('text', { value: 'Heading 1' })]),
      u('paragraph', {}, [u('text', { value: 'Some text under heading 1.' })]),
      u('section', { depth: 2, data: { hName: 'section' } }, [
        u('heading', { depth: 2 }, [u('text', { value: 'Heading 1.1' })]),
        u('paragraph', {}, [u('text', { value: 'Additional text.' })])
      ]),
      u('section', { depth: 2, data: { hName: 'section' } }, [
        u('heading', { depth: 2 }, [u('text', { value: 'Heading 1.2' })]),
        u('paragraph', {}, [
          u('emphasis', {}, [u('text', { value: 'More' })]),
          u('text', { value: ' additional text.' })
        ]),
        u('section', { depth: 3, data: { hName: 'section' } }, [
          u('heading', { depth: 3 }, [u('text', { value: 'Heading 1.2.1' })]),
          u('blockquote', {}, [
            u('paragraph', {}, [u('text', { value: 'Blockquote' })])
          ]),
          u('paragraph', {}, [u('text', { value: 'Text.' })]),
          u('section', { depth: 5, data: { hName: 'section' } }, [
            u('heading', { depth: 5 }, [u('text', { value: 'Bad heading' })]),
            u('paragraph', {}, [u('text', { value: 'Lorem ipsum.' })])
          ])
        ]),
        u('section', { depth: 3, data: { hName: 'section' } }, [
          u('heading', { depth: 3 }, [u('text', { value: 'Heading 1.2.2' })]),
          u('paragraph', {}, [u('text', { value: 'Dolor sit amet.' })])
        ])
      ])
    ]),
    u('section', { depth: 1, data: { hName: 'section' } }, [
      u('heading', { depth: 1 }, [u('text', { value: 'Heading 2' })]),
      u('paragraph', {}, [u('text', { value: 'Another top level heading.' })]),
      u('section', { depth: 6, data: { hName: 'section' } }, [
        u('heading', { depth: 6 }, [
          u('text', { value: 'Another bad heading' })
        ]),
        u('paragraph', {}, [u('text', { value: 'When will it end?' })])
      ])
    ])
  ])

  const tree = remark().parse(document)

  sectionize()(tree)
  removePosition(tree, true)
  t.deepEqual(tree, expected)

  t.end()
})

test('sectionize with orphan nodes at start', function (t) {
  const document = dedent`
    Some orphan text.

    > An orphan blockquote.

    ## Heading 1

    Some text under heading 1.

    ## Heading 2

    Additional text.
  `

  const expected = u('root', {}, [
    u('paragraph', {}, [u('text', { value: 'Some orphan text.' })]),
    u('blockquote', {}, [
      u('paragraph', {}, [u('text', { value: 'An orphan blockquote.' })])
    ]),
    u('section', { depth: 2, data: { hName: 'section' } }, [
      u('heading', { depth: 2 }, [u('text', { value: 'Heading 1' })]),
      u('paragraph', {}, [u('text', { value: 'Some text under heading 1.' })]),
    ]),
    u('section', { depth: 2, data: { hName: 'section' } }, [
      u('heading', { depth: 2 }, [u('text', { value: 'Heading 2' })]),
      u('paragraph', {}, [u('text', { value: 'Additional text.' })])
    ]),
  ])

  const tree = remark().parse(document)

  sectionize()(tree)
  removePosition(tree, true)
  t.deepEqual(tree, expected)

  t.end()
})
