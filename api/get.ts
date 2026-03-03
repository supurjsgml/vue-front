import fetch from '~/api/commonApi'; 

export const getAPI = () => {
  const { fetchInstance } = fetch();
  return {
    
    /**
     * 잠자고 있는 레독을 깨워 보아요
     *
     */
    async getAlive() {
      return await fetchInstance("/api/getUrl", { method: "GET" });
    }
  }
}
