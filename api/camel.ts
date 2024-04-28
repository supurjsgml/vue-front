import fetch from '~/api/commonApi'; 

export const camelAPI = () => {
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
    async getGenFile(data: object) {
      return fetch("/com/genFile", "POST", data, "blob");
    }
  }
}
