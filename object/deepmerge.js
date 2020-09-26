var deepmerge = function (target, overwrite, options) {
  if (options && options.copy) {
    target = deepcopy(target);
  }

  for (let key in overwrite) {
    if (!overwrite.hasOwnProperty(key)) {
      continue;
    }
    switch (typeof (overwrite[key])) {
      case "object":
        if (typeof (target[key]) === "object") {
          deepmerge(target[key], overwrite[key]);
        } else {
          target[key] = overwrite[key];
        }
        break;
      default:
        target[key] = overwrite[key];
        break;
    }
  }

  return target;
};

module.exports = deepmerge;