function NumbersWithComma(x) {
  if (!x && x !== 0) return "";
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default NumbersWithComma;
