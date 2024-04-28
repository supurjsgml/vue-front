import { camelAPI } from "~/api/camel"
// import { defineStore } from '@nuxtjs/composition-api';
import { defineStore } from 'pinia';

export const camelStore = defineStore("camel", {
  state: (): camelStateType => ({
    filterSlides: [{ title: "전체글", catIdx: "all", active: 0 }],
    data: {
      camelStr: ""
    }
  }),
  getters: {
    // activeSlide(state: camelStateType): FilterSlidesType {
    //   return (
    //     state.filterSlides.find((filter) => {
    //       if (!state.query.ctgNo) return filter.catIdx === "all"
    //       return state.query.ctgNo === filter.catIdx
    //     }) || state.filterSlides[0]
    //   )
    // }
  },
  actions: {
    // setCateNo(cateNo: string) {
    //   if (cateNo) return (this.query.ctgNo = cateNo)
    //   return (this.query.ctgNo = "")
    // },
    // setSortStd(std: string) {
    //   this.query.sortStd = std
    // },
    // savePageNo(no: number) {
    //   this.query.pageNo = no
    // },
    // async initCmyState() {
    //   const { body } = await camelAPI().getCateList()
    //   const filterData = body.map((filter: any, index: number) => {
    //     return {
    //       title: filter.ctgNm,
    //       catIdx: filter.ctgNo,
    //       active: index + 1
    //     }
    //   })
    //   this.filterSlides.push(...filterData)
    // },
    // async fetchCmyList() {
    //   this.query.pageNo = 0
    //   const { body } = await camelAPI().getCommunityList(this.query)
    //   this.cmyList = body?.bbmList || []
    //   this.cmyCount = body?.bbmCnt || 0
    //   this.fixCmyList = body?.fixBbm || []
    // },
    // async addCmyList($state: any) {
    //   if (this.cmyCount > this.cmyList.length) {
    //     this.query.pageNo++
    //     const { body } = await camelAPI().getCommunityList(this.query)
    //     this.cmyList.push(...body.bbmList)
    //     $state.loaded()
    //   }
    // },
    // async fetchCmyKwdList(kwd: string) {
    //   this.kwdParam.kwd = kwd
    //   this.kwdParam.ctgNo = this.query.ctgNo
    //   this.kwdParam.pageNo = 1
    //   const { body } = await camelAPI().getCommunityKwdList(this.kwdParam)
    //   this.totalRecords = body?.page?.totalRecords || 0
    //   this.cmyKwdList = body?.data || []
    // },
    // async addCmyKwdList($state: any) {
    //   if (this.totalRecords > this.cmyKwdList.length) {
    //     this.kwdParam.pageNo++
    //     const { body } = await camelAPI().getCommunityKwdList(this.kwdParam)
    //     this.cmyKwdList.push(...body.data)
    //     $state.loaded()
    //   }
    // },
    async genFile() {
      return await camelAPI().getGenFile(this.data);
    }
  }
})
