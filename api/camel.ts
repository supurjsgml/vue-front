
export const camelAPI = () => {
  const BASE_URL = useRuntimeConfig().public.apiBase;
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
      return await $fetch(BASE_URL.concat("/com/genFile") , {
        method:'POST',
        headers:{
          'Content-Type':'application/json'
          // authorization : 'token',
        },
        body: { data },
        responseType : "blob"
      });
    }
  }
}
