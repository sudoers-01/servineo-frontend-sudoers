export const disableJobMock = async () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve("ok"), 1200);
  });
};
