const redisClient = {
    get: async () => null,
    set: async () => "OK",
    ttl: async () => -1,
    incr: async () => 1,
    expire: async () => 1,
    del: async () => 1,
    connect: async () => {},
    on: () => {}
};

module.exports = redisClient;
