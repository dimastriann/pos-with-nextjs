const identity = (x: unknown) => x;

const motion = new Proxy(
  {},
  {
    get: (_target, tag: string) => {
      const Component = ({ children, ...props }: Record<string, unknown>) => {
        const React = require('react');
        const filtered = Object.fromEntries(
          Object.entries(props).filter(
            ([k]) =>
              ![
                'initial',
                'animate',
                'exit',
                'transition',
                'whileHover',
                'whileTap',
                'variants',
                'layout',
              ].includes(k),
          ),
        );
        return React.createElement(tag, filtered, children);
      };
      Component.displayName = `motion.${tag}`;
      return Component;
    },
  },
);

const AnimatePresence = ({ children }: { children: unknown }) => children;

export {
  motion,
  AnimatePresence,
  identity as useAnimation,
  identity as useMotionValue,
};
export default { motion, AnimatePresence };
