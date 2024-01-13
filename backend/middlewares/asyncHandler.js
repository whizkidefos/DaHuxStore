const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
        res.status(500).json({
            message: error.message,
            stack: process.env.NODE_ENV === 'production' ? null : error.stack,
        });
    });
};

export default asyncHandler;