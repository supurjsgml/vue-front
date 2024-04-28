
export const camelAPI = () => {
  const BASE_URL = process.env.BASE_URL || "";
  return {

    // /**
    //  * 
    //  * @author 이건희
    //  * @param query
    //  */
    // async getCommunityDetailReComment(query: { upperCmtNo: number; pageNo: number; pageSize: number }) {
    //   Object.assign(query, { commentType: "REPLY" })
    //   return await cmyFetchInstance("/cmy/getComment", { method: "GET", query })
    // },

    /**
     * 
     * @author 이건희
     * @param {string} camelStr - dto str Data
     */
    async getGenFile(camelStr: string) {
      return await $fetch("https://redoc-dd2a33735c4a.herokuapp.com/com/genFile" , {
        method:'GET',
        headers:{
          'Content-Type':'application/json'
          // authorization : 'token',
        }
        // body: { "camelStr" : camelStr }
      });
    }
  }
}
