declare interface FilterSlidesType {
  title: string
  catIdx: string
  active: number
}
declare interface camelStateType {
  data: {
    camelStr: string
  },
  filterSlides: FilterSlidesType[]
}
