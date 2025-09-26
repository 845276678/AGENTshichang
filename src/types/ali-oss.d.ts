/* eslint-disable */
declare module 'ali-oss' {
  interface OSSOptions {
    region: string
    accessKeyId: string
    accessKeySecret: string
    bucket: string
    endpoint?: string
    [key: string]: any
  }

  interface PutResult {
    name: string
    url: string
    res?: {
      status: number
      headers: Record<string, string>
    }
  }

  interface HeadResult {
    status: number
    res: {
      status: number
      headers: Record<string, string>
    }
    meta?: Record<string, any>
  }

  interface ListResult {
    objects?: Array<{
      name: string
      size: number
      lastModified: string
      etag: string
      storageClass: string
    }>
    prefixes?: string[]
    isTruncated: boolean
    nextMarker?: string
  }

  interface ListOptions {
    prefix?: string
    marker?: string
    'max-keys'?: number
    delimiter?: string
  }

  interface SignatureUrlOptions {
    expires?: number
    method?: string
    'Content-Type'?: string
    'Content-MD5'?: string
    [key: string]: any
  }

  class OSS {\n    options: OSSOptions
    constructor(options: OSSOptions)

    put(key: string, file: Buffer | string, options?: any): Promise<PutResult>
    head(key: string): Promise<HeadResult>
    delete(key: string): Promise<any>
    deleteMulti(keys: string[]): Promise<any>
    copy(targetKey: string, sourceKey: string): Promise<any>
    list(options?: ListOptions): Promise<ListResult>
    signatureUrl(key: string, options?: SignatureUrlOptions): string
    getBucketInfo(): Promise<any>
  }

  export = OSS
}
