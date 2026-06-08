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
    },

    /**
     * 그라파나 대시보드 iframe src 가져오기
     */
    async getGrafanaIframeSrc() {
      return await $fetch("/api/grafana/iframe-src", { method: "GET" });
    },

    /**
     * 대시보드 미니 통계 위젯 데이터 가져오기
     */
    async getDashboardStats() {
      return await fetchInstance("/api/front/dashboardStats", { method: "GET" });
    },

    /**
     * 방문자 수 증가시키기 (POST)
     */
    async incrementVisitor(pageName: string, isNewSession: boolean) {
      return await fetchInstance("/api/front/hit", { 
        method: "POST", 
        body: { pageName, isNewSession } 
      });
    },

    /**
     * 페이지별 누적 방문자 수 데이터 가져오기 (GET)
     */
    async getPageStats() {
      return await fetchInstance("/api/front/pageStats", { method: "GET" });
    }
  }
}
