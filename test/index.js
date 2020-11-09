for (let i = 0; i < 10; i++) {
  setTimeout(() => {
    console.log(i, new Date());
  }, 1000 * 5 * i);
}
