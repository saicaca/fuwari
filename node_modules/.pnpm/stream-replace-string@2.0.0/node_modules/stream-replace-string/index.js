import { Transform, Readable } from 'stream'
import { StringDecoder } from 'string_decoder'

/**
 *
 * @param {string} searchStr
 * @param {string} replaceWith
 * @param {number} limit
 */
const replace = (searchStr, replaceWith, options = {}) => {
  // Defaulting
  if (!Object.prototype.hasOwnProperty.call(options, 'limit')) {
    options.limit = Infinity
  }
  if (!Object.prototype.hasOwnProperty.call(options, 'bufferReplaceStream')) {
    options.bufferReplaceStream = true
  }

  // Type checking
  if (typeof searchStr !== 'string') {
    throw new TypeError('searchStr must be a string.')
  }
  if (!(
    typeof replaceWith === 'string' ||
    replaceWith instanceof Promise ||
    typeof replaceWith === 'function' ||
    replaceWith instanceof Readable
  )) {
    throw new TypeError('replaceWith must be either a string, a promise resolving a string, a function returning string, a function returning a promise resolving a string, or a readable stream.')
  }
  if (typeof options !== 'object') {
    throw new TypeError('options must be an object.')
  }
  if (!(
    (Number.isInteger(options.limit) && options.limit > 0) ||
    (options.limit === Infinity)
  )) {
    throw new TypeError('options.limit must be a positive integer or infinity.')
  }
  if (typeof options.bufferReplaceStream !== 'boolean') {
    throw new TypeError('options.bufferReplaceStream must be a boolean.')
  }
  const limit = options.limit

  // This stuff is for if replaceWith is a readable stream
  let replaceWithBuffer = ''
  let replaceWithNewChunk
  let isDecodingReplaceWithStream = false
  const startDecodingReplaceWithStream = () => {
    isDecodingReplaceWithStream = true
    const stringDecoder = new StringDecoder('utf-8')
    const dataHandler = data => {
      replaceWithNewChunk = stringDecoder.write(data)
      if (options.bufferReplaceStream) {
        replaceWithBuffer += replaceWithNewChunk
      }
    }

    const endHandler = () => {
      replaceWithNewChunk = stringDecoder.end()
      if (options.bufferReplaceStream) {
        replaceWithBuffer += replaceWithNewChunk
      }
    }

    replaceWith
      .on('data', dataHandler)
      .on('end', endHandler)
  }
  if (replaceWith instanceof Readable) {
    if (options.bufferReplaceStream) {
      startDecodingReplaceWithStream()
    } else {
      replaceWith.pause()
    }
  }

  // Create a new string decoder to turn buffers into strings
  const stringDecoder = new StringDecoder('utf-8')

  // Whether the limit has been reached
  let doneReplacing = false
  // Then number of matches
  let matches = 0

  // The in progress matches waiting for next chunk to be continued
  /**
   * An array of numbers, each number is an index which marks the start of the string `unsureBuffer`
   */
  let partialMatchesFromPrevChunk = []

  // The string data that we aren't yet sure it's part of the search string or not
  // We have to hold on to this until we are sure.
  let unsureBuffer = ''

  // Get the replace string
  let replaceStr = typeof replaceWith === 'string' ? replaceWith : undefined
  const pushReplaceStr = async () => {
    switch (typeof replaceWith) {
      case 'string': {
        transform.push(replaceStr)
        break
      }
      case 'function': {
        const returnedStr = await replaceWith(matches)
        if (typeof returnedStr !== 'string') {
          throw new TypeError('Replace function did not return a string or a promise resolving a string.')
        }
        transform.push(returnedStr)
        break
      }
      case 'object': {
        if (replaceWith instanceof Promise) {
          replaceStr = await replaceWith
          if (typeof replaceStr !== 'string') {
            throw new TypeError('Replace promise did not resolve to a string.')
          }
          transform.push(replaceStr)
        } else if (replaceWith instanceof Readable) {
          await new Promise((resolve, reject) => {
            if (!isDecodingReplaceWithStream) {
              startDecodingReplaceWithStream()
            }
            // Push the buffer so far
            transform.push(replaceWithBuffer)
            if (!replaceWith.readableEnded) {
              replaceWith
                .on('data', () => {
                  transform.push(replaceWithNewChunk)
                })
                .once('end', () => {
                  transform.push(replaceWithNewChunk)
                  resolve()
                })
              replaceWith.resume()
            } else {
              resolve()
            }
          })
        }
        break
      }
      default: {
        throw new Error("This shouldn't happen.")
      }
    }
  }

  const foundMatch = async () => {
    await pushReplaceStr()
    matches++
    if (matches === limit) {
      doneReplacing = true
    }
  }

  const transform = new Transform({
    async transform (chunk, encoding, callback) {
      if (doneReplacing) {
        callback(undefined, chunk)
      } else {
        // Convert to utf-8
        let chunkStr = stringDecoder.write(chunk)

        /**
         * This is the end index of the string that we might replace later
         */
        let keepEndIndex
        // Continue / complete / discard partial matches from previous chunks
        for (let i = 0; i < partialMatchesFromPrevChunk.length;) {
          const pastChunkMatchIndex = partialMatchesFromPrevChunk[i]
          const chunkStrEndIndex = searchStr.length - (unsureBuffer.length - pastChunkMatchIndex)
          const strToCheck = unsureBuffer.slice(pastChunkMatchIndex) + chunkStr.slice(0, chunkStrEndIndex)
          if (searchStr.startsWith(strToCheck)) {
            if (strToCheck.length >= searchStr.length) {
              // Match completed
              // Push the previous part of the string that was saved
              transform.push(unsureBuffer.slice(0, pastChunkMatchIndex))
              await foundMatch()
              unsureBuffer = ''
              partialMatchesFromPrevChunk = []
              chunkStr = chunkStr.slice(chunkStrEndIndex)
            } else {
              // Match continued
              keepEndIndex = keepEndIndex ?? 0
              i++
            }
          } else {
            // Match discarded
            partialMatchesFromPrevChunk.splice(i, 1)
          }
        }

        // Check for completed / partial matches in the current chunk
        let chunkStrIndex = 0
        while (chunkStrIndex < chunkStr.length) {
          const strToCheck = chunkStr.slice(chunkStrIndex, chunkStrIndex + searchStr.length)
          if (searchStr.startsWith(strToCheck)) {
            if (strToCheck.length === searchStr.length) {
              // Match completed
              transform.push(chunkStr.slice(0, chunkStrIndex))
              await foundMatch()
              chunkStr = chunkStr.slice(chunkStrIndex + strToCheck.length)
              chunkStrIndex = 0
            } else {
              // Partial match
              partialMatchesFromPrevChunk.push(chunkStrIndex)
              keepEndIndex = keepEndIndex ?? chunkStrIndex
              chunkStrIndex++
            }
          } else {
            // No match
            if (keepEndIndex === undefined) {
              // Push the string out right away
              transform.push(chunkStr.slice(chunkStrIndex, chunkStrIndex + 1))
              chunkStr = chunkStr.slice(chunkStrIndex + 1)
            } else {
              // We are keeping the string
              chunkStrIndex++
            }
          }
        }
        // Save the part of the chunk that might be part of a match later
        unsureBuffer += chunkStr.slice(keepEndIndex)
        // This is needed
        callback()
      }
    },
    flush (callback) {
      // Release the unsureBuffer
      callback(undefined, unsureBuffer)
    }
  })

  return transform
}

export default replace
