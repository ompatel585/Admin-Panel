const number = new Intl.NumberFormat("en");
const dateTime = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });
const date = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export const formatCount = (value: number) => number.format(value);
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));
export const formatDate = (iso: string) => date.format(new Date(iso));
