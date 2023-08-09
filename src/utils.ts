export const cx = (...args: (string | null | boolean | undefined)[]) => {
  return args.filter((a) => Boolean(a)).join(" ");
};
