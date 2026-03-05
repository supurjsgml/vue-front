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
    }
  }
}
