const defaultQueueParams = {
  limit: 5,
  retries: 3
};
function runConcurrentQueries(params) {
  const allParams = {
    ...defaultQueueParams,
    ...params
  };
  const paramsWithCount = allParams;
  const paramsWithPromises = allParams;
  const isCallback = typeof paramsWithCount.total === "number";
  const count = isCallback ? paramsWithCount.total : paramsWithPromises.promises.length;
  const limit = Math.max(1, Math.min(allParams.limit || 1, count));
  const retries = Math.max(1, allParams.retries || 1);
  const results = Array(count).fill(void 0);
  let nextIndex = 0;
  const resolving = /* @__PURE__ */ new Set();
  let rejected = false;
  let resolved = false;
  return new Promise((resolve, reject) => {
    function resolvedItem() {
      if (rejected || resolved) {
        return;
      }
      if (!resolving.size && nextIndex > count) {
        resolved = true;
        resolve(results);
        return;
      }
      if (resolving.size < limit && nextIndex <= count) {
        startNext();
      }
    }
    function fail(index, err) {
      function done(failed) {
        resolving.delete(index);
        if (failed) {
          rejected = true;
          reject(err);
        } else {
          resolvedItem();
        }
      }
      if (allParams.onError) {
        let retry;
        try {
          retry = allParams.onError(index, err, params);
        } catch (err2) {
          err = err2;
          done(true);
          return;
        }
        if (retry instanceof Promise) {
          retry.then(() => {
            done(false);
          }).catch((err2) => {
            err = err2;
            done(true);
          });
          return;
        }
        done(false);
      } else {
        done(true);
      }
    }
    function run(index, retry) {
      resolving.add(index);
      const p = isCallback ? paramsWithCount.callback(index) : paramsWithPromises.promises[index];
      allParams.onStart?.(index, params);
      p.then((value) => {
        resolving.delete(index);
        results[index] = value;
        allParams.onSuccess?.(index, params, value);
        resolvedItem();
      }).catch((err) => {
        if (retry < retries) {
          setTimeout(() => {
            run(index, retry + 1);
          });
        } else if (!rejected) {
          fail(index, err);
        }
      });
    }
    function startNext() {
      const index = nextIndex++;
      if (index >= count) {
        resolvedItem();
        return;
      }
      run(index, 0);
    }
    for (let i = 0; i < limit; i++) {
      startNext();
    }
  });
}

export { defaultQueueParams, runConcurrentQueries };
