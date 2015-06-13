function mergeDefaults(defaults, other = {}) {
  const result = {};
  Object.keys(other)
  .filter((key) => defaults[key] === void 0)
  .concat(Object.keys(defaults))
  .map((key) => {
    result[key] = (typeof defaults[key] === 'object' && !Array.isArray(defaults[key])
    ? mergeDefaults(defaults[key], other[key])
    : other[key]) || defaults[key];
  });
  return result;
}

const config = {
  defaults: {
    server: {
      hostname: 'localhost',
    },
  },
  development: {
    server: {
      port: 8080,
    },
  },
  production: {
    server: {
      port: 80,
    },
  },
};

export default mergeDefaults(config.defaults, config[process.env.NODE_ENV || 'development']);
