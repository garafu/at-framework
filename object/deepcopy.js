var deepcopy = function (target) {
  return JSON.parse(JSON.stringify(target));
};

module.exports = deepcopy;