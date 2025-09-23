'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  Download,
  Eye,
  Share2,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Brain,
  Star,
  Calendar,
  User,
  BarChart3,
  Target,
  Lightbulb,
  Building
} from 'lucide-react'

interface BusinessPlanResultProps {
  params: {
    id: string
  }
}

export default function BusinessPlanResultPage({ params }: BusinessPlanResultProps) {
  const [activeSection, setActiveSection] = useState('overview')

  // 妯℃嫙鐢熸垚缁撴灉鏁版嵁
  const businessPlan = {
    id: params.id,
    title: "鏅鸿兘鍐扮椋熸潗绠＄悊鍔╂墜",
    category: "鐢熸椿鍒涙剰",
    generatedAt: "2024-01-15T10:30:00Z",
    status: "completed",
    overallScore: 8.7,

    // 姒傝鏁版嵁
    overview: {
      valueIncrease: "16鍊?,
      marketSize: "1,200浜垮厓",
      roi: "35%",
      timeline: "18涓湀",
      fundingNeeded: "800涓囧厓"
    },

    // AI鍒嗘瀽闃舵缁撴灉
    stages: [
      {
        id: 'concept_analysis',
        name: '鍒涙剰瑙ｆ瀽涓庣悊瑙?,
        aiProvider: '鐧惧害鏂囧績涓€瑷€',
        status: 'completed',
        score: 8.5,
        keyFindings: [
          '鏍稿績鐥涚偣锛氶鏉愭氮璐圭巼楂樿揪30%锛岀鐞嗘晥鐜囦綆',
          '鐩爣鐢ㄦ埛锛?5-45宀佷腑浜у搴紝鍋ュ悍鎰忚瘑寮?,
          '鍒涙柊鐐癸細AI瑙嗚璇嗗埆+鏅鸿兘鎺ㄨ崘绠楁硶缁撳悎'
        ],
        deliverables: ['姒傚康鎻愬彇鎶ュ憡', '鍏抽敭璇嶆爣绛?, '闂闄堣堪']
      },
      {
        id: 'market_research',
        name: '甯傚満璋冪爺涓庡垎鏋?,
        aiProvider: '璁鏄熺伀',
        status: 'completed',
        score: 9.1,
        keyFindings: [
          'TAM: 1,200浜垮厓锛堟櫤鑳藉灞呴鍝佺鐞嗗競鍦猴級',
          '鍙戠幇8涓洿鎺ョ珵鍝侊紝甯傚満绔炰簤婵€鐑堜絾鏈夊樊寮傚寲绌洪棿',
          '鐩爣鐢ㄦ埛浠樿垂鎰忔効寮猴紝骞冲潎鍙帴鍙椾环鏍?99鍏?骞?
        ],
        deliverables: ['甯傚満瑙勬ā鎶ュ憡', '绔炲搧鍒嗘瀽', '鐢ㄦ埛鐢诲儚']
      },
      {
        id: 'tech_architecture',
        name: '鎶€鏈灦鏋勮璁?,
        aiProvider: '闃块噷閫氫箟鍗冮棶',
        status: 'completed',
        score: 8.8,
        keyFindings: [
          '閲囩敤寰湇鍔℃灦鏋勶紝鏀寔鍗冧竾绾х敤鎴峰苟鍙?,
          '鏍稿績鎶€鏈細璁＄畻鏈鸿瑙?NLP+鎺ㄨ崘绠楁硶',
          '浜戞湇鍔℃垚鏈浼帮細15涓囧厓/鏈堬紙鎴愮啛鏈燂級'
        ],
        deliverables: ['绯荤粺鏋舵瀯鍥?, 'API璁捐', '鎶€鏈爤閫夋嫨']
      },
      {
        id: 'financial_model',
        name: '璐㈠姟寤烘ā涓庨娴?,
        aiProvider: '鑵捐娣峰厓',
        status: 'completed',
        score: 8.9,
        keyFindings: [
          '5骞撮璁℃敹鍏ワ細2.8浜垮厓锛屽噣鍒╂鼎鐜囪揪25%',
          '鎶曡祫鍥炴姤鐜囷細35%锛屽洖鏀舵湡锛?.5骞?,
          '铻嶈祫闇€姹傦細A杞?00涓囷紝B杞?000涓?
        ],
        deliverables: ['5骞磋储鍔￠娴?, '鎶曡祫鍥炴姤鍒嗘瀽', '浼板€兼ā鍨?]
      },
      {
        id: 'legal_compliance',
        name: '娉曞緥鍚堣鍒嗘瀽',
        aiProvider: '鏅鸿氨GLM',
        status: 'completed',
        score: 8.3,
        keyFindings: [
          '闇€鐢宠2椤瑰彂鏄庝笓鍒╋紝3椤瑰疄鐢ㄦ柊鍨嬩笓鍒?,
          '绗﹀悎銆婁釜浜轰俊鎭繚鎶ゆ硶銆嬭姹傦紝鏃犻噸澶у悎瑙勯闄?,
          '寤鸿娉ㄥ唽5涓被鍒晢鏍囷紝棰勪及璐圭敤3涓囧厓'
        ],
        deliverables: ['鍚堣妫€鏌ヨ〃', '鐭ヨ瘑浜ф潈绛栫暐', '椋庨櫓璇勪及']
      }
    ],

    // 鏂囨。鍒楄〃
    documents: [
      {
        name: '瀹屾暣鍟嗕笟璁″垝涔?,
        type: 'PDF',
        pages: 120,
        size: '12.5MB',
        description: '鍖呭惈鎵€鏈夊垎鏋愬唴瀹圭殑瀹屾暣鐗堝晢涓氳鍒掍功'
      },
      {
        name: '鎶曡祫鑰呮紨绀烘枃绋?,
        type: 'PPT',
        pages: 25,
        size: '8.2MB',
        description: '15鍒嗛挓璺紨涓撶敤PPT锛岀獊鍑烘牳蹇冧寒鐐?
      },
      {
        name: '鎶€鏈疄鐜版枃妗?,
        type: 'PDF',
        pages: 45,
        size: '6.8MB',
        description: '璇︾粏鐨勬妧鏈灦鏋勫拰瀹炵幇鏂规'
      },
      {
        name: '璐㈠姟棰勬祴妯″瀷',
        type: 'Excel',
        pages: 1,
        size: '2.1MB',
        description: '鍙紪杈戠殑5骞磋储鍔￠娴婨xcel妯″瀷'
      },
      {
        name: '娉曞緥鍚堣鎸囧崡',
        type: 'PDF',
        pages: 28,
        size: '3.2MB',
        description: '娉曞緥椋庨櫓璇勪及鍜屽悎瑙勬搷浣滄寚鍗?
      }
    ]
  }

  const handleDownload = (docType: string) => {
    console.log(`涓嬭浇 ${docType}`)
    // 瀹為檯涓嬭浇閫昏緫
  }

  const handleShare = () => {
    console.log('鍒嗕韩鍟嗕笟璁″垝')
    // 鍒嗕韩閫昏緫
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* 椤甸潰澶撮儴 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <Badge variant="default" className="bg-green-100 text-green-800">
                  鐢熸垚瀹屾垚
                </Badge>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {businessPlan.title}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  鐢熸垚鏃堕棿锛歿new Date(businessPlan.generatedAt).toLocaleString('zh-CN')}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  缁煎悎璇勫垎锛歿businessPlan.overallScore}/10
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                鍒嗕韩
              </Button>
              <Button onClick={() => handleDownload('all')}>
                <Download className="w-4 h-4 mr-2" />
                涓嬭浇鍏ㄩ儴
              </Button>
            </div>
          </div>

          {/* 鏍稿績鎸囨爣姒傝 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{businessPlan.overview.valueIncrease}</div>
                  <div className="text-sm text-muted-foreground">浠峰€兼彁鍗?/div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{businessPlan.overview.marketSize}</div>
                  <div className="text-sm text-muted-foreground">甯傚満瑙勬ā</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <DollarSign className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{businessPlan.overview.roi}</div>
                  <div className="text-sm text-muted-foreground">鎶曡祫鍥炴姤鐜?/div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Calendar className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">{businessPlan.overview.timeline}</div>
                  <div className="text-sm text-muted-foreground">棰勬湡鏃堕棿</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Building className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-indigo-600">{businessPlan.overview.fundingNeeded}</div>
                  <div className="text-sm text-muted-foreground">铻嶈祫闇€姹?/div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="overview">鎬昏</TabsTrigger>
            <TabsTrigger value="analysis">鍒嗘瀽</TabsTrigger>
            <TabsTrigger value="documents">鏂囨。</TabsTrigger>
            <TabsTrigger value="insights">娲炲療</TabsTrigger>
          </TabsList>

          {/* 鎬昏椤电 */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI鍒嗘瀽闃舵鎬昏 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI鍒嗘瀽闃舵瀹屾垚鎯呭喌
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {businessPlan.stages.map((stage) => (
                      <div key={stage.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="font-medium">{stage.name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">{stage.aiProvider}</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">{stage.score}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 鍏抽敭鎴愭灉鎽樿 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    鍏抽敭鎴愭灉鎽樿
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-800 mb-2">甯傚満鏈轰細</h4>
                      <p className="text-sm text-green-700">
                        鏅鸿兘瀹跺眳椋熷搧绠＄悊甯傚満瑙勬ā杈?,200浜垮厓锛屽勾澧為暱鐜?5%锛屽叿鏈夊法澶у晢涓氭綔鍔?
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">鎶€鏈彲琛屾€?/h4>
                      <p className="text-sm text-blue-700">
                        鍩轰簬鎴愮啛鐨凙I瑙嗚璇嗗埆鎶€鏈紝鎶€鏈闄╁彲鎺э紝棰勮18涓湀鍐呭彲瀹屾垚浜у搧寮€鍙?
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <h4 className="font-medium text-purple-800 mb-2">鐩堝埄鍓嶆櫙</h4>
                      <p className="text-sm text-purple-700">
                        5骞村唴棰勮瀹炵幇2.8浜垮厓鏀跺叆锛屽噣鍒╂鼎鐜?5%锛屾姇璧勫洖鎶ョ巼35%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 璇︾粏鍒嗘瀽椤电 */}
          <TabsContent value="analysis" className="space-y-6">
            {businessPlan.stages.map((stage) => (
              <Card key={stage.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">鉁?/span>
                      </div>
                      {stage.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{stage.aiProvider}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">{stage.score}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">鍏抽敭鍙戠幇</h4>
                      <ul className="space-y-2">
                        {stage.keyFindings.map((finding, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">浜や粯鐗?/h4>
                      <div className="flex flex-wrap gap-2">
                        {stage.deliverables.map((deliverable, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {deliverable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* 鏂囨。涓嬭浇椤电 */}
          <TabsContent value="documents" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {businessPlan.documents.map((doc, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{doc.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{doc.type}</span>
                            <span>鈥?/span>
                            <span>{doc.pages > 1 ? `${doc.pages}椤礰 : doc.pages + '涓枃浠?}</span>
                            <span>鈥?/span>
                            <span>{doc.size}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{doc.description}</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => console.log(`棰勮 ${doc.name}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        棰勮
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(doc.type)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        涓嬭浇
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI娲炲療椤电 */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>鎴愬姛鍏抽敭鍥犵礌</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">AI鎶€鏈紭鍔垮拰涓撳埄淇濇姢</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm">鐢ㄦ埛浣撻獙鍜屼骇鍝佸樊寮傚寲</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span className="text-sm">蹇€熸墿寮犲拰甯傚満鏁欒偛</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <span className="text-sm">鍚堜綔浼欎即鍜屾笭閬撳缓璁?/span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>椋庨櫓鎻愮ず</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="text-sm">澶у巶杩涘叆甯︽潵鐨勭珵浜夊帇鍔?/span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span className="text-sm">鐢ㄦ埛闅愮鏁版嵁瀹夊叏鍚堣</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full" />
                      <span className="text-sm">鎶€鏈凯浠ｅ拰浜у搧鍗囩骇鎴愭湰</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>涓嬩竴姝ヨ鍔ㄥ缓璁?/CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">绔嬪嵆琛屽姩锛?涓湀鍐咃級</h4>
                      <p className="text-sm text-muted-foreground">缁勫缓鏍稿績鍥㈤槦锛屽惎鍔ㄦ妧鏈師鍨嬪紑鍙戯紝鐢宠鏍稿績涓撳埄</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">鐭湡鐩爣锛?涓湀鍐咃級</h4>
                      <p className="text-sm text-muted-foreground">瀹屾垚MVP寮€鍙戯紝杩涜绉嶅瓙鐢ㄦ埛娴嬭瘯锛屽噯澶嘇杞瀺璧勬潗鏂?/p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">涓湡瑙勫垝锛?涓湀鍐咃級</h4>
                      <p className="text-sm text-muted-foreground">瀹屾垚A杞瀺璧勶紝鎵╁ぇ鍥㈤槦瑙勬ā锛屽惎鍔ㄦ寮忎骇鍝佸紑鍙?/p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
