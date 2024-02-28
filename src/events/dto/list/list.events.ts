export class ListEvents {
  when?: WhenEventFilter = WhenEventFilter.All;
  page = 1;
  limit = 10;
}

export enum WhenEventFilter {
  All = 1,
  Today,
  Tommorow,
  ThisWeek,
  NextWeek,
}
