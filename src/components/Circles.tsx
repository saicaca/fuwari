import { motion } from "framer-motion";

export const Circles = () => {
  return (
    <>
      <motion.div
        initial={{
          opacity: 0,
          scale: 0,
          x: "-50%",
          y: "-50%",
        }}
        animate={{
          opacity: [0, 1, 0.5, 0],
          scale: 1,

          z: 0,
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          delay: 0,
        }}
        className="absolute left-1/2 top-1/2  h-[11.25rem] w-[11.25rem] rounded-[50%] bg-sky-500/[0.2] shadow-[0_8px_16px_rgb(0_0_0/0.4)]"
      ></motion.div>
      <motion.div
        initial={{
          opacity: 0,
          scale: 0,
          x: "-50%",
          y: "-50%",
        }}
        animate={{
          opacity: [0, 1, 0.5, 0],
          scale: 1,

          z: 0,
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          delay: 2,
        }}
        className="absolute left-1/2 top-1/2  h-[11.25rem] w-[11.25rem] rounded-[50%] bg-sky-500/[0.08] shadow-[0_8px_16px_rgb(0_0_0/0.4)]"
      ></motion.div>
      <motion.div
        initial={{
          opacity: 0,
          scale: 0,
          x: "-50%",
          y: "-50%",
        }}
        animate={{
          opacity: [0, 1, 0.5, 0],
          scale: 1,

          z: 0,
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          delay: 4,
        }}
        className="absolute left-1/2 top-1/2  h-[11.25rem] w-[11.25rem] rounded-[50%] bg-sky-500/[0.08] shadow-[0_8px_16px_rgb(0_0_0/0.4)]"
      ></motion.div>
    </>
  );
};
