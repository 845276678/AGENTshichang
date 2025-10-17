'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layout } from '@/components/layout';
import {
  GitBranch,
  Plus,
  Edit,
  Clock,
  Tag,
  TrendingUp,
  Share2,
  Download,
  Lightbulb,
  Zap,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';

interface IdeaNode {
  id: string;
  content: string;
  maturity: number;
  parentId?: string;
  timestamp: Date;
  tags: string[];
  impact: 'MINOR' | 'MAJOR' | 'PIVOT';
  reason?: string;
}

interface IdeaGrowthTree {
  id: string;
  title: string;
  description?: string;
  rootIdeaId: string;
  nodes: IdeaNode[];
  totalNodes: number;
  maxDepth: number;
  createdAt: Date;
  updatedAt: Date;
}

interface TimelineEvent {
  id: string;
  content: string;
  reason?: string;
  impact: 'MINOR' | 'MAJOR' | 'PIVOT';
  timestamp: Date;
  tags: string[];
}

// 自定义节点组件
const IdeaTreeNode = ({ data }: { data: any }) => {
  const getMaturityColor = (maturity: number) => {
    if (maturity < 30) return 'border-red-400 bg-red-50';
    if (maturity < 60) return 'border-yellow-400 bg-yellow-50';
    return 'border-green-400 bg-green-50';
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'PIVOT': return <Zap className="w-4 h-4 text-purple-600" />;
      case 'MAJOR': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      default: return <Lightbulb className="w-4 h-4 text-yellow-600" />;
    }
  };

  return (
    <div className={`px-4 py-3 border-2 rounded-lg min-w-48 max-w-64 ${getMaturityColor(data.maturity)}`}>
      <Handle type="target" position={Position.Top} />

      <div className="flex items-center gap-2 mb-2">
        {getImpactIcon(data.impact)}
        <div className="text-sm font-medium text-gray-900 truncate">
          {data.content}
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <Badge variant="secondary" className="text-xs">
          {data.maturity}%
        </Badge>
        <div className="text-xs text-gray-500">
          {new Date(data.timestamp).toLocaleDateString()}
        </div>
      </div>

      {data.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {data.tags.slice(0, 2).map((tag: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {data.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{data.tags.length - 2}
            </Badge>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  ideaNode: IdeaTreeNode,
};

export default function IdeaGrowthTreePage() {
  const [trees, setTrees] = useState<IdeaGrowthTree[]>([]);
  const [selectedTree, setSelectedTree] = useState<IdeaGrowthTree | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [showNewNodeDialog, setShowNewNodeDialog] = useState(false);
  const [showBiddingNotification, setShowBiddingNotification] = useState(false);
  const [biddingInfo, setBiddingInfo] = useState<{
    treeId: string;
    ideaContent: string;
    ideaId: string;
  } | null>(null);
  const [newNodeData, setNewNodeData] = useState({
    content: '',
    reason: '',
    impact: 'MINOR' as 'MINOR' | 'MAJOR' | 'PIVOT',
    tags: '',
    parentId: ''
  });

  useEffect(() => {
    // 设置页面标题
    document.title = '创意生长树 - AI智能体市场'

    // 检查是否从竞价完成页面跳转而来
    const checkBiddingRedirect = () => {
      const biddingTreeId = sessionStorage.getItem('biddingGrowthTreeId');
      const biddingIdeaId = sessionStorage.getItem('biddingIdeaId');
      const biddingIdeaContent = sessionStorage.getItem('biddingIdeaContent');

      if (biddingTreeId && biddingIdeaId && biddingIdeaContent) {
        console.log('🌱 检测到来自竞价的自动生成数据:', {
          treeId: biddingTreeId,
          ideaId: biddingIdeaId,
          ideaContent: biddingIdeaContent.substring(0, 50) + '...'
        });

        setBiddingInfo({
          treeId: biddingTreeId,
          ideaId: biddingIdeaId,
          ideaContent: biddingIdeaContent
        });
        setShowBiddingNotification(true);

        // 清理sessionStorage以避免重复显示
        sessionStorage.removeItem('biddingGrowthTreeId');
        sessionStorage.removeItem('biddingIdeaId');
        sessionStorage.removeItem('biddingIdeaContent');
      }
    };

    checkBiddingRedirect();
    fetchUserTrees();
  }, []);

  useEffect(() => {
    if (selectedTree) {
      generateFlowData(selectedTree);
      generateTimeline(selectedTree);
    }
  }, [selectedTree]);

  const fetchUserTrees = async () => {
    try {
      const response = await fetch('/api/idea-growth-tree');
      if (response.ok) {
        const data = await response.json();
        setTrees(data.trees);

        // 如果有来自竞价的树ID，优先选中该树
        if (biddingInfo?.treeId) {
          const biddingTree = data.trees.find((tree: IdeaGrowthTree) => tree.id === biddingInfo.treeId);
          if (biddingTree) {
            setSelectedTree(biddingTree);
            console.log('✅ 自动选中来自竞价的生长树:', biddingTree.title);
          } else if (data.trees.length > 0) {
            setSelectedTree(data.trees[0]);
          }
        } else if (data.trees.length > 0) {
          setSelectedTree(data.trees[0]);
        }
      }
    } catch (error) {
      toast.error('获取创意生长树失败');
    } finally {
      setLoading(false);
    }
  };

  const generateFlowData = (tree: IdeaGrowthTree) => {
    // 将树形数据转换为ReactFlow所需的节点和边
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    // 构建节点层级映射
    const nodesByLevel: Record<number, IdeaNode[]> = {};
    const visited = new Set<string>();

    // 找到根节点
    const rootNodes = tree.nodes.filter(node => !node.parentId);
    if (rootNodes.length === 0) return;

    // BFS构建层级
    const queue = rootNodes.map(node => ({ node, level: 0 }));

    while (queue.length > 0) {
      const { node, level } = queue.shift()!;

      if (visited.has(node.id)) continue;
      visited.add(node.id);

      if (!nodesByLevel[level]) nodesByLevel[level] = [];
      nodesByLevel[level].push(node);

      // 添加子节点到队列
      const children = tree.nodes.filter(n => n.parentId === node.id);
      children.forEach(child => queue.push({ node: child, level: level + 1 }));
    }

    // 生成节点位置
    Object.entries(nodesByLevel).forEach(([levelStr, levelNodes]) => {
      const level = parseInt(levelStr);
      const levelWidth = levelNodes.length * 300;
      const startX = -levelWidth / 2;

      levelNodes.forEach((node, index) => {
        flowNodes.push({
          id: node.id,
          type: 'ideaNode',
          position: {
            x: startX + (index * 300) + 150,
            y: level * 200
          },
          data: {
            ...node,
            content: node.content.substring(0, 50) + (node.content.length > 50 ? '...' : '')
          }
        });

        // 生成连接边
        if (node.parentId) {
          flowEdges.push({
            id: `${node.parentId}-${node.id}`,
            source: node.parentId,
            target: node.id,
            type: 'smoothstep',
            style: {
              stroke: node.impact === 'PIVOT' ? '#8b5cf6' :
                      node.impact === 'MAJOR' ? '#3b82f6' : '#6b7280',
              strokeWidth: node.impact === 'PIVOT' ? 3 : 2
            }
          });
        }
      });
    });

    setNodes(flowNodes);
    setEdges(flowEdges);
  };

  const generateTimeline = (tree: IdeaGrowthTree) => {
    const timelineEvents: TimelineEvent[] = tree.nodes
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(node => ({
        id: node.id,
        content: node.content,
        reason: node.reason,
        impact: node.impact,
        timestamp: node.timestamp,
        tags: node.tags
      }));

    setTimeline(timelineEvents);
  };

  const addNewNode = async () => {
    if (!selectedTree || !newNodeData.content.trim()) {
      toast.error('请填写完整信息');
      return;
    }

    try {
      const response = await fetch('/api/idea-growth-tree/node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treeId: selectedTree.id,
          content: newNodeData.content,
          reason: newNodeData.reason,
          impact: newNodeData.impact,
          tags: newNodeData.tags.split(',').map(t => t.trim()).filter(Boolean),
          parentId: newNodeData.parentId || null
        })
      });

      if (response.ok) {
        toast.success('创意节点添加成功');
        setShowNewNodeDialog(false);
        setNewNodeData({
          content: '',
          reason: '',
          impact: 'MINOR',
          tags: '',
          parentId: ''
        });
        fetchUserTrees(); // 重新获取数据
      } else {
        const error = await response.json();
        toast.error(error.message || '添加失败');
      }
    } catch (error) {
      toast.error('添加节点失败');
    }
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'PIVOT': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'MAJOR': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getImpactLabel = (impact: string) => {
    switch (impact) {
      case 'PIVOT': return '方向转变';
      case 'MAJOR': return '重大修改';
      default: return '轻微调整';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
      {/* 竞价自动生成通知 */}
      {showBiddingNotification && biddingInfo && (
        <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <GitBranch className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    🎉 创意生长树已自动生成！
                  </h3>
                  <p className="text-gray-700 mb-3">
                    基于您的创意竞价结果，系统已自动为您创建了完整的创意演化记录。包含：
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">原始创意</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {biddingInfo.ideaContent.substring(0, 60)}...
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">专家分析</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        AI专家团队的讨论内容和出价分析
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="flex items-center gap-2 mb-1">
                        <Lightbulb className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium">演化记录</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        用户补充和专家反馈的完整时间轴
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    您可以在此基础上继续手动添加创意节点，记录后续的演化过程。
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBiddingNotification(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">关闭</span>
                ✕
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">创意生长树</h1>
          <p className="text-gray-600 mt-2">追踪你的创意演化历程</p>
        </div>
        <div className="flex gap-4">
          <Dialog open={showNewNodeDialog} onOpenChange={setShowNewNodeDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                添加节点
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加创意节点</DialogTitle>
                <DialogDescription>
                  记录你的创意演化过程
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">创意内容</label>
                  <Textarea
                    value={newNodeData.content}
                    onChange={(e) => setNewNodeData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="描述你的创意修改..."
                    className="min-h-20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">修改原因</label>
                  <Input
                    value={newNodeData.reason}
                    onChange={(e) => setNewNodeData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="为什么做这个修改？"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">影响程度</label>
                  <Select value={newNodeData.impact} onValueChange={(value: any) => setNewNodeData(prev => ({ ...prev, impact: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MINOR">轻微调整</SelectItem>
                      <SelectItem value="MAJOR">重大修改</SelectItem>
                      <SelectItem value="PIVOT">方向转变</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">标签</label>
                  <Input
                    value={newNodeData.tags}
                    onChange={(e) => setNewNodeData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="用逗号分隔多个标签"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addNewNode} className="flex-1">添加节点</Button>
                  <Button variant="outline" onClick={() => setShowNewNodeDialog(false)}>取消</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            分享
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            导出
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧时间轴 */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                演化时间轴
              </CardTitle>
              <CardDescription>
                按时间顺序查看创意变化
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {timeline.map((event, index) => (
                    <div key={event.id} className="relative">
                      {index < timeline.length - 1 && (
                        <div className="absolute left-2 top-8 w-0.5 h-full bg-gray-200"></div>
                      )}
                      <div className="flex items-start gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 bg-white flex-shrink-0 mt-1 ${
                          event.impact === 'PIVOT' ? 'border-purple-400' :
                          event.impact === 'MAJOR' ? 'border-blue-400' : 'border-yellow-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {event.content.substring(0, 80)}
                            {event.content.length > 80 && '...'}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`text-xs ${getImpactColor(event.impact)}`}>
                              {getImpactLabel(event.impact)}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(event.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          {event.reason && (
                            <div className="text-xs text-gray-600 mb-2">
                              原因: {event.reason}
                            </div>
                          )}
                          {event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {event.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* 右侧树状图 */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                创意演化图
              </CardTitle>
              <CardDescription>
                可视化展示创意的分支和发展
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 border rounded-lg">
                {nodes.length > 0 ? (
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                  >
                    <Controls />
                    <Background variant="dots" gap={12} size={1} />
                  </ReactFlow>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <GitBranch className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>暂无创意树数据</p>
                      <p className="text-sm">添加第一个创意节点开始记录</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 统计信息 */}
      {selectedTree && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{selectedTree.totalNodes}</div>
                  <div className="text-sm text-gray-600">总节点数</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{selectedTree.maxDepth}</div>
                  <div className="text-sm text-gray-600">最大深度</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {selectedTree.nodes.filter(n => n.impact === 'PIVOT').length}
                  </div>
                  <div className="text-sm text-gray-600">方向转变</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {Math.floor((new Date().getTime() - new Date(selectedTree.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                  </div>
                  <div className="text-sm text-gray-600">存在天数</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    </Layout>
  );
}