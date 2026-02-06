export const navigate = (path: string) => {
  history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
