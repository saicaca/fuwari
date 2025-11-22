# stream-replace-string
Replaces strings in a stream.

## Install
```shell
npm i stream-replace-string
```

## Using
```javascript
import replace from 'stream-replace-string'
import { createReadStream, createWriteStream } from 'fs'

createReadStream("./input.txt")
    .pipe(replace("{fruit}", "apple"))
    .pipe(createWriteStream("./output.txt"))
```
You can also replace multiple different words by piping your data through multiple replace streams
```javascript
createReadStream("./input.txt")
    .pipe(replace("good", "great"))
    .pipe(replace("bad", "horrible"))
    .pipe(replace("grey", "gray"))
    .pipe(createWriteStream("./output.txt"))
```

### The `replace` function
```javascript
replace(searchStr, replaceWith, options)
```
- Parameters
    - `searchStr` - The string to search for. This must be a string, and cannot be a regex.
    - `replaceWith` - There are a couple of different things you can use:
        - String - Inserts the string.
        - Promise resolving a string - Once the promise is resolved, the given string is used.
        - Replacer function - This is a custom replacer function. The function can take a parameter, `matches`, which is the number of matches so far (for the first match, this will be `0`). This function should return a string or a promise resolving a string.
        - Readable stream - A readable stream can be given, which can make more chunks available sooner. See `options.bufferReplaceStream` for options if you are using a readable stream.
    - `options` (optional) - An object of options.
        - `limit` (optional, default `Infinity`) - The maximum number of strings to replace. This can be useful if you know there is only 1 occurrence of `searchStr`. Once this limit is reached, the transform stream will stop transforming anything.
        - `bufferReplaceStream` (optional, default `true`) - This is for when you use a readable stream for `replaceWith`. If this is true, the `replaceWith` stream will be read right away, and be kept in memory to be used once a match is found. For fastest performance, keep this to be `true`. If your `replaceWith` stream is very large and you have a limit of 1, you can set this to `false` to save memory.
- Returns
    - Returns a transform stream. See the [How It Works](#how-it-works) section for more information.

## How It Works

### The transform stream
The [`replace`](#the-`replace`-function) function returns a Node.js transform stream. Transform streams take in chunks and can also be read. In this particular transform stream, it takes a string and outputs the same string, except that it replaces the replace.

### Efficient memory use.
The tricky part with this transform stream is knowing when to hold chunks, and when to pass them on. Let's say we were looking for `'paper'` in our text. If our first chunk was: `'perfect pot'`, this module knows that there is no way the string `'perfect pot'` will fit into the search string, `'paper'`. We can then pass the chunks onto the output of the transform stream, available right away for the stream consumer. However, if our first chunk was: `'p'`, we can't pass that on, because there is a change that the next chunk could start with `'aper'`. Since we aren't sure if the `'p'` will be replaced or not, we hold on to this text, and check it once we get the next chunk. If we get `'aper'` in the next chunk, we replace the text. If we get something else, like `'ear'`, we can attach it to the `'p'` and output `'pear'`. It gets even more complicated when multiple potential matches are possible. Let's say we get `'pap'` in our first chunk. We need to be watching the first `'p'` and the third `'p'`, because it could end up being `'paper'`, if the next chunk was `'er'`, or it could end of being `'papaper'`. This package is smart and it will efficiently find matches spanning multiple chunks, and get rid of text it knows won't have a match.

#### Importing with ESModules
```javascript
import replace from 'stream-replace-string'
```