
export const camelAPI = () => {
  return {

    // /**
    //  * 
    //  * @author 이건희
    //  * @param query
    //  * @param query.upperCmtNo // 상위 댓글 번호
    //  * @param query.pageNo // 페이지 번호
    //  * @param query.pageSize // 페이지 크기
    //  */
    // async getCommunityDetailReComment(query: { upperCmtNo: number; pageNo: number; pageSize: number }) {
    //   Object.assign(query, { commentType: "REPLY" })
    //   return await cmyFetchInstance("/cmy/getComment", { method: "GET", query })
    // },

    /**
     * 
     * @author 이건희
     * @param {Object} body - 커뮤니티 키워드 목록 조회 파라미터
     */
    async getGenFile(camelStr: string) {
      // const { data } = await useFetch('search api url', {
      //   method:'POST',
      //   headers:{
      //     'Content-Type':'application/json',
      //     authorization : 'token',
      //   },
      //   body: { "word" : searchValue.value },
      // });
      console.log("tttt : ", camelStr);
      // return await useFetch ("/cmy/kywrdSrch", { method: "POST", body })
    }
  }
}
