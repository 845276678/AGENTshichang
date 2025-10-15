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
  const [trees, setTrees] = useState&lt;IdeaGrowthTree[]&gt;([]);
  const [selectedTree, setSelectedTree] = useState&lt;IdeaGrowthTree | null&gt;(null);
  const [timeline, setTimeline] = useState&lt;TimelineEvent[]&gt;([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [showNewNodeDialog, setShowNewNodeDialog] = useState(false);
  const [newNodeData, setNewNodeData] = useState({
    content: '',
    reason: '',
    impact: 'MINOR' as 'MINOR' | 'MAJOR' | 'PIVOT',
    tags: '',
    parentId: ''
  });

  useEffect(() => {
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
        if (data.trees.length > 0) {
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
    const nodesByLevel: Record&lt;number, IdeaNode[]&gt; = {};
    const visited = new Set&lt;string&gt;();

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
      &lt;div className="container mx-auto px-4 py-8"&gt;
        &lt;div className="animate-pulse"&gt;
          &lt;div className="h-8 bg-gray-200 rounded w-1/3 mb-6"&gt;&lt;/div&gt;
          &lt;div className="h-96 bg-gray-200 rounded"&gt;&lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    );
  }

  return (
    &lt;div className="container mx-auto px-4 py-8"&gt;
      &lt;div className="flex justify-between items-center mb-8"&gt;
        &lt;div&gt;
          &lt;h1 className="text-3xl font-bold text-gray-900"&gt;创意生长树&lt;/h1&gt;
          &lt;p className="text-gray-600 mt-2"&gt;追踪你的创意演化历程&lt;/p&gt;
        &lt;/div&gt;
        &lt;div className="flex gap-4"&gt;
          &lt;Dialog open={showNewNodeDialog} onOpenChange={setShowNewNodeDialog}&gt;
            &lt;DialogTrigger asChild&gt;
              &lt;Button className="flex items-center gap-2"&gt;
                &lt;Plus className="w-4 h-4" /&gt;
                添加节点
              &lt;/Button&gt;
            &lt;/DialogTrigger&gt;
            &lt;DialogContent&gt;
              &lt;DialogHeader&gt;
                &lt;DialogTitle&gt;添加创意节点&lt;/DialogTitle&gt;
                &lt;DialogDescription&gt;
                  记录你的创意演化过程
                &lt;/DialogDescription&gt;
              &lt;/DialogHeader&gt;
              &lt;div className="space-y-4"&gt;
                &lt;div&gt;
                  &lt;label className="block text-sm font-medium mb-2"&gt;创意内容&lt;/label&gt;
                  &lt;Textarea
                    value={newNodeData.content}
                    onChange={(e) =&gt; setNewNodeData(prev =&gt; ({ ...prev, content: e.target.value }))}
                    placeholder="描述你的创意修改..."
                    className="min-h-20"
                  /&gt;
                &lt;/div&gt;
                &lt;div&gt;
                  &lt;label className="block text-sm font-medium mb-2"&gt;修改原因&lt;/label&gt;
                  &lt;Input
                    value={newNodeData.reason}
                    onChange={(e) =&gt; setNewNodeData(prev =&gt; ({ ...prev, reason: e.target.value }))}
                    placeholder="为什么做这个修改？"
                  /&gt;
                &lt;/div&gt;
                &lt;div&gt;
                  &lt;label className="block text-sm font-medium mb-2"&gt;影响程度&lt;/label&gt;
                  &lt;Select value={newNodeData.impact} onValueChange={(value: any) =&gt; setNewNodeData(prev =&gt; ({ ...prev, impact: value }))}&gt;
                    &lt;SelectTrigger&gt;
                      &lt;SelectValue /&gt;
                    &lt;/SelectTrigger&gt;
                    &lt;SelectContent&gt;
                      &lt;SelectItem value="MINOR"&gt;轻微调整&lt;/SelectItem&gt;
                      &lt;SelectItem value="MAJOR"&gt;重大修改&lt;/SelectItem&gt;
                      &lt;SelectItem value="PIVOT"&gt;方向转变&lt;/SelectItem&gt;
                    &lt;/SelectContent&gt;
                  &lt;/Select&gt;
                &lt;/div&gt;
                &lt;div&gt;
                  &lt;label className="block text-sm font-medium mb-2"&gt;标签&lt;/label&gt;
                  &lt;Input
                    value={newNodeData.tags}
                    onChange={(e) =&gt; setNewNodeData(prev =&gt; ({ ...prev, tags: e.target.value }))}
                    placeholder="用逗号分隔多个标签"
                  /&gt;
                &lt;/div&gt;
                &lt;div className="flex gap-2"&gt;
                  &lt;Button onClick={addNewNode} className="flex-1"&gt;添加节点&lt;/Button&gt;
                  &lt;Button variant="outline" onClick={() =&gt; setShowNewNodeDialog(false)}&gt;取消&lt;/Button&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            &lt;/DialogContent&gt;
          &lt;/Dialog&gt;
          &lt;Button variant="outline" className="flex items-center gap-2"&gt;
            &lt;Share2 className="w-4 h-4" /&gt;
            分享
          &lt;/Button&gt;
          &lt;Button variant="outline" className="flex items-center gap-2"&gt;
            &lt;Download className="w-4 h-4" /&gt;
            导出
          &lt;/Button&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      &lt;div className="grid grid-cols-1 lg:grid-cols-4 gap-6"&gt;
        {/* 左侧时间轴 */}
        &lt;div className="lg:col-span-1"&gt;
          &lt;Card className="h-full"&gt;
            &lt;CardHeader&gt;
              &lt;CardTitle className="flex items-center gap-2"&gt;
                &lt;Clock className="w-5 h-5" /&gt;
                演化时间轴
              &lt;/CardTitle&gt;
              &lt;CardDescription&gt;
                按时间顺序查看创意变化
              &lt;/CardDescription&gt;
            &lt;/CardHeader&gt;
            &lt;CardContent&gt;
              &lt;ScrollArea className="h-96"&gt;
                &lt;div className="space-y-4"&gt;
                  {timeline.map((event, index) =&gt; (
                    &lt;div key={event.id} className="relative"&gt;
                      {index &lt; timeline.length - 1 && (
                        &lt;div className="absolute left-2 top-8 w-0.5 h-full bg-gray-200"&gt;&lt;/div&gt;
                      )}
                      &lt;div className="flex items-start gap-3"&gt;
                        &lt;div className={`w-4 h-4 rounded-full border-2 bg-white flex-shrink-0 mt-1 ${
                          event.impact === 'PIVOT' ? 'border-purple-400' :
                          event.impact === 'MAJOR' ? 'border-blue-400' : 'border-yellow-400'
                        }`} /&gt;
                        &lt;div className="flex-1 min-w-0"&gt;
                          &lt;div className="text-sm font-medium text-gray-900 mb-1"&gt;
                            {event.content.substring(0, 80)}
                            {event.content.length &gt; 80 && '...'}
                          &lt;/div&gt;
                          &lt;div className="flex items-center gap-2 mb-2"&gt;
                            &lt;Badge className={`text-xs ${getImpactColor(event.impact)}`}&gt;
                              {getImpactLabel(event.impact)}
                            &lt;/Badge&gt;
                            &lt;span className="text-xs text-gray-500"&gt;
                              {new Date(event.timestamp).toLocaleDateString()}
                            &lt;/span&gt;
                          &lt;/div&gt;
                          {event.reason && (
                            &lt;div className="text-xs text-gray-600 mb-2"&gt;
                              原因: {event.reason}
                            &lt;/div&gt;
                          )}
                          {event.tags.length &gt; 0 && (
                            &lt;div className="flex flex-wrap gap-1"&gt;
                              {event.tags.map((tag, tagIndex) =&gt; (
                                &lt;Badge key={tagIndex} variant="outline" className="text-xs"&gt;
                                  {tag}
                                &lt;/Badge&gt;
                              ))}
                            &lt;/div&gt;
                          )}
                        &lt;/div&gt;
                      &lt;/div&gt;
                    &lt;/div&gt;
                  ))}
                &lt;/div&gt;
              &lt;/ScrollArea&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;
        &lt;/div&gt;

        {/* 右侧树状图 */}
        &lt;div className="lg:col-span-3"&gt;
          &lt;Card className="h-full"&gt;
            &lt;CardHeader&gt;
              &lt;CardTitle className="flex items-center gap-2"&gt;
                &lt;GitBranch className="w-5 h-5" /&gt;
                创意演化图
              &lt;/CardTitle&gt;
              &lt;CardDescription&gt;
                可视化展示创意的分支和发展
              &lt;/CardDescription&gt;
            &lt;/CardHeader&gt;
            &lt;CardContent&gt;
              &lt;div className="h-96 border rounded-lg"&gt;
                {nodes.length &gt; 0 ? (
                  &lt;ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                  &gt;
                    &lt;Controls /&gt;
                    &lt;Background variant="dots" gap={12} size={1} /&gt;
                  &lt;/ReactFlow&gt;
                ) : (
                  &lt;div className="flex items-center justify-center h-full text-gray-500"&gt;
                    &lt;div className="text-center"&gt;
                      &lt;GitBranch className="w-12 h-12 mx-auto mb-3 text-gray-400" /&gt;
                      &lt;p&gt;暂无创意树数据&lt;/p&gt;
                      &lt;p className="text-sm"&gt;添加第一个创意节点开始记录&lt;/p&gt;
                    &lt;/div&gt;
                  &lt;/div&gt;
                )}
              &lt;/div&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;
        &lt;/div&gt;
      &lt;/div&gt;

      {/* 统计信息 */}
      {selectedTree && (
        &lt;div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8"&gt;
          &lt;Card&gt;
            &lt;CardContent className="pt-6"&gt;
              &lt;div className="flex items-center gap-2"&gt;
                &lt;Target className="w-5 h-5 text-blue-600" /&gt;
                &lt;div&gt;
                  &lt;div className="text-2xl font-bold"&gt;{selectedTree.totalNodes}&lt;/div&gt;
                  &lt;div className="text-sm text-gray-600"&gt;总节点数&lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;
          &lt;Card&gt;
            &lt;CardContent className="pt-6"&gt;
              &lt;div className="flex items-center gap-2"&gt;
                &lt;TrendingUp className="w-5 h-5 text-green-600" /&gt;
                &lt;div&gt;
                  &lt;div className="text-2xl font-bold"&gt;{selectedTree.maxDepth}&lt;/div&gt;
                  &lt;div className="text-sm text-gray-600"&gt;最大深度&lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;
          &lt;Card&gt;
            &lt;CardContent className="pt-6"&gt;
              &lt;div className="flex items-center gap-2"&gt;
                &lt;Zap className="w-5 h-5 text-purple-600" /&gt;
                &lt;div&gt;
                  &lt;div className="text-2xl font-bold"&gt;
                    {selectedTree.nodes.filter(n =&gt; n.impact === 'PIVOT').length}
                  &lt;/div&gt;
                  &lt;div className="text-sm text-gray-600"&gt;方向转变&lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;
          &lt;Card&gt;
            &lt;CardContent className="pt-6"&gt;
              &lt;div className="flex items-center gap-2"&gt;
                &lt;Clock className="w-5 h-5 text-orange-600" /&gt;
                &lt;div&gt;
                  &lt;div className="text-2xl font-bold"&gt;
                    {Math.floor((new Date().getTime() - new Date(selectedTree.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                  &lt;/div&gt;
                  &lt;div className="text-sm text-gray-600"&gt;存在天数&lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            &lt;/CardContent&gt;
          &lt;/Card&gt;
        &lt;/div&gt;
      )}
    &lt;/div&gt;
  );
}