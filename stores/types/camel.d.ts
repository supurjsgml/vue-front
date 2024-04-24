declare interface FilterSlidesType {
  title: string
  catIdx: string
  active: number
}
declare interface camelStateType {
  query: {
    ctgNo: string
    sortStd: string
    pageNo: number
    pageSize: number
  }
  kwdParam: {
    ctgNo: string
    kwd: string
    colType: string
    kwdSort: string
    boldFlg: boolean
    pageNo: number
    pageSize: number
  }
  filterSlides: FilterSlidesType[]
  cmyList: any[]
  cmyCount: number
  fixCmyList: any[]
  cmyKwdList: any[]
  totalRecords: number
  uploadingCount: number
  camelStr: string
}
