export type PageData = {
	url: string
	blockGroupIndex: number
}

const pageDataMap = new Map<Request, PageData>()

export function getPageData(request: Request): PageData {
	let data = pageDataMap.get(request)
	if (!data) {
		data = {
			url: request.url,
			blockGroupIndex: -1,
		}
		pageDataMap.set(request, data)
	}
	return data
}
