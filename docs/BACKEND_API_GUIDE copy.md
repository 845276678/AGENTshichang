## 🚀 后端API开发指南 (Next.js API Routes)

### 📁 后端API结构

```
src/app/api/
├── auth/                   # 认证相关API
│   ├── login/
│   │   └── route.ts       # POST /api/auth/login
│   ├── register/
│   │   └── route.ts       # POST /api/auth/register
│   ├── logout/
│   │   └── route.ts       # POST /api/auth/logout
│   ├── profile/
│   │   └── route.ts       # GET/PUT /api/auth/profile
│   └── verify-email/
│       └── route.ts       # POST /api/auth/verify-email
├── agents/                 # Agent相关API
│   ├── route.ts           # GET /api/agents (列表)
│   ├── [id]/
│   │   ├── route.ts       # GET/PUT/DELETE /api/agents/[id]
│   │   ├── reviews/
│   │   │   └── route.ts   # GET/POST /api/agents/[id]/reviews
│   │   └── purchase/
│   │       └── route.ts   # POST /api/agents/[id]/purchase
│   ├── categories/
│   │   └── route.ts       # GET /api/agents/categories
│   ├── search/
│   │   └── route.ts       # GET /api/agents/search
│   └── upload/
│       └── route.ts       # POST /api/agents/upload
├── workshop/              # 创意工作坊API
│   ├── projects/
│   │   ├── route.ts       # GET/POST /api/workshop/projects
│   │   └── [id]/
│   │       ├── route.ts   # GET/PUT/DELETE /api/workshop/projects/[id]
│   │       ├── versions/
│   │       │   └── route.ts # GET/POST /api/workshop/projects/[id]/versions
│   │       └── collaborate/
│   │           └── route.ts # POST /api/workshop/projects/[id]/collaborate
│   └── generate/
│       └── route.ts       # POST /api/workshop/generate
├── payments/              # 支付相关API
│   ├── credits/
│   │   ├── purchase/
│   │   │   └── route.ts   # POST /api/payments/credits/purchase
│   │   ├── balance/
│   │   │   └── route.ts   # GET /api/payments/credits/balance
│   │   └── history/
│   │       └── route.ts   # GET /api/payments/credits/history
│   ├── orders/
│   │   ├── route.ts       # GET /api/payments/orders
│   │   └── [id]/
│   │       └── route.ts   # GET /api/payments/orders/[id]
│   └── webhooks/
│       ├── alipay/
│       │   └── route.ts   # POST /api/payments/webhooks/alipay
│       └── wechat/
│           └── route.ts   # POST /api/payments/webhooks/wechat
├── users/                 # 用户管理API
│   ├── [id]/
│   │   └── route.ts       # GET/PUT /api/users/[id]
│   ├── avatar/
│   │   └── route.ts       # POST /api/users/avatar
│   └── settings/
│       └── route.ts       # GET/PUT /api/users/settings
├── admin/                 # 管理员API
│   ├── users/
│   │   └── route.ts       # GET /api/admin/users
│   ├── agents/
│   │   ├── route.ts       # GET /api/admin/agents
│   │   └── [id]/
│   │       ├── approve/
│   │       │   └── route.ts # POST /api/admin/agents/[id]/approve
│   │       └── reject/
│   │           └── route.ts # POST /api/admin/agents/[id]/reject
│   └── analytics/
│       └── route.ts       # GET /api/admin/analytics
├── files/                 # 文件管理API
│   ├── upload/
│   │   └── route.ts       # POST /api/files/upload
│   └── [id]/
│       └── route.ts       # GET/DELETE /api/files/[id]
├── notifications/         # 通知API
│   ├── route.ts          # GET /api/notifications
│   └── [id]/
│       ├── read/
│       │   └── route.ts  # POST /api/notifications/[id]/read
│       └── route.ts      # DELETE /api/notifications/[id]
└── health/               # 健康检查
    └── route.ts          # GET /api/health
```

### 🔧 核心技术栈和工具

- **框架**: Next.js 14 API Routes
- **ORM**: Prisma
- **数据库**: MySQL (Zeabur)
- **认证**: NextAuth.js
- **验证**: Zod
- **文件存储**: 阿里云OSS
- **支付**: 支付宝 + 微信支付
- **邮件**: 阿里云邮件服务
- **队列**: Redis + Bull
- **日志**: Winston

### 📋 后端开发任务清单

#### 🔐 认证系统API (优先级: 高)

**1. 用户注册API**
```typescript
// app/api/auth/register/route.ts
export async function POST(request: Request) {
  const body = await request.json();

  // 验证输入数据
  const schema = z.object({
    email: z.string().email(),
    username: z.string().min(3).max(50),
    password: z.string().min(8),
    displayName: z.string().optional(),
  });

  try {
    const { email, username, password, displayName } = schema.parse(body);

    // 检查用户是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "用户已存在" },
        { status: 400 }
      );
    }

    // 创建用户
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash: hashedPassword,
        displayName: displayName || username,
        credits: 100, // 新用户赠送积分
      },
    });

    // 发送验证邮件
    await sendVerificationEmail(user.email, user.id);

    // 记录操作日志
    await logOperation({
      action: 'USER_REGISTER',
      userId: user.id,
      details: { email, username },
    });

    return NextResponse.json({
      success: true,
      message: "注册成功，请查收验证邮件",
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "输入数据无效", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "注册失败" },
      { status: 500 }
    );
  }
}
```

**2. 用户登录API**
```typescript
// app/api/auth/login/route.ts
export async function POST(request: Request) {
  const body = await request.json();

  const schema = z.object({
    loginId: z.string(), // email or username
    password: z.string(),
    rememberMe: z.boolean().optional(),
  });

  try {
    const { loginId, password, rememberMe } = schema.parse(body);

    // 查找用户
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginId },
          { username: loginId }
        ],
        status: 'active',
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在或已被禁用" },
        { status: 401 }
      );
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "密码错误" },
        { status: 401 }
      );
    }

    // 生成JWT令牌
    const token = await generateJWTToken(user.id, rememberMe);

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 记录登录日志
    await logOperation({
      action: 'USER_LOGIN',
      userId: user.id,
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        credits: user.credits,
      },
      token,
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "登录失败" },
      { status: 500 }
    );
  }
}
```

**3. 用户配置文件API**
```typescript
// app/api/auth/profile/route.ts
export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      role: true,
      credits: true,
      totalSpent: true,
      createdAt: true,
      settings: true,
    },
  });

  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await request.json();
  const schema = z.object({
    displayName: z.string().min(1).max(100).optional(),
    bio: z.string().max(500).optional(),
    avatarUrl: z.string().url().optional(),
  });

  try {
    const data = schema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data,
      select: {
        id: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
      },
    });

    await logOperation({
      action: 'USER_UPDATE_PROFILE',
      userId: user.id,
      details: data,
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "输入数据无效", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "更新失败" },
      { status: 500 }
    );
  }
}
```

#### 🤖 Agent管理API (优先级: 高)

**1. Agent列表API**
```typescript
// app/api/agents/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const order = searchParams.get('order') || 'desc';
  const priceType = searchParams.get('priceType');

  const skip = (page - 1) * limit;

  // 构建查询条件
  const where: any = {
    status: 'published',
  };

  if (category) {
    where.category = { slug: category };
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (priceType) {
    where.priceType = priceType;
  }

  // 构建排序
  const orderBy: any = {};
  switch (sortBy) {
    case 'rating':
      orderBy.ratingAvg = order;
      break;
    case 'downloads':
      orderBy.downloadsCount = order;
      break;
    case 'price':
      orderBy.basePrice = order;
      break;
    default:
      orderBy.createdAt = order;
  }

  try {
    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.agent.count({ where }),
    ]);

    return NextResponse.json({
      agents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Get agents error:", error);
    return NextResponse.json(
      { error: "获取Agent列表失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await request.json();
  const schema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().min(10),
    detailedDescription: z.string().optional(),
    categoryId: z.string().uuid(),
    priceType: z.enum(['free', 'one_time', 'subscription', 'pay_per_use']),
    basePrice: z.number().min(0).optional(),
    creditsPerUse: z.number().min(1).optional(),
    capabilities: z.array(z.string()),
    supportedLanguages: z.array(z.string()),
    inputTypes: z.array(z.string()),
    outputTypes: z.array(z.string()),
    configSchema: z.record(z.any()).optional(),
    defaultConfig: z.record(z.any()).optional(),
    tags: z.array(z.string()).optional(),
  });

  try {
    const data = schema.parse(body);

    // 生成唯一slug
    const slug = await generateUniqueSlug(data.name);

    const agent = await prisma.agent.create({
      data: {
        ...data,
        slug,
        creatorId: user.id,
        status: 'review', // 新创建的Agent需要审核
      },
    });

    // 处理标签关联
    if (data.tags && data.tags.length > 0) {
      await createAgentTagRelations(agent.id, data.tags);
    }

    await logOperation({
      action: 'AGENT_CREATE',
      userId: user.id,
      resourceType: 'agent',
      resourceId: agent.id,
      details: { name: data.name },
    });

    return NextResponse.json(agent, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "输入数据无效", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Create agent error:", error);
    return NextResponse.json(
      { error: "创建Agent失败" },
      { status: 500 }
    );
  }
}
```

**2. Agent详情API**
```typescript
// app/api/agents/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await prisma.agent.findUnique({
      where: {
        id: params.id,
        status: 'published',
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        reviews: {
          where: { status: 'active' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            reviews: {
              where: { status: 'active' },
            },
          },
        },
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agent不存在" },
        { status: 404 }
      );
    }

    // 增加浏览计数
    await prisma.agent.update({
      where: { id: params.id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(agent);

  } catch (error) {
    console.error("Get agent details error:", error);
    return NextResponse.json(
      { error: "获取Agent详情失败" },
      { status: 500 }
    );
  }
}
```

**3. Agent购买API**
```typescript
// app/api/agents/[id]/purchase/route.ts
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    const agent = await prisma.agent.findUnique({
      where: { id: params.id, status: 'published' },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agent不存在" },
        { status: 404 }
      );
    }

    // 检查是否已购买
    const existingPurchase = await prisma.userAgentPurchase.findFirst({
      where: {
        userId: user.id,
        agentId: params.id,
        isActive: true,
      },
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: "您已购买该Agent" },
        { status: 400 }
      );
    }

    // 检查积分余额
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { credits: true },
    });

    if (!currentUser || currentUser.credits < agent.basePrice) {
      return NextResponse.json(
        { error: "积分不足" },
        { status: 400 }
      );
    }

    // 使用事务处理购买
    const result = await prisma.$transaction(async (tx) => {
      // 扣除积分
      await tx.user.update({
        where: { id: user.id },
        data: {
          credits: {
            decrement: agent.basePrice,
          },
        },
      });

      // 创建购买记录
      const purchase = await tx.userAgentPurchase.create({
        data: {
          userId: user.id,
          agentId: params.id,
          purchaseType: agent.priceType === 'subscription' ? 'subscription' : 'one_time',
          expiresAt: agent.priceType === 'subscription'
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30天
            : null,
        },
      });

      // 记录积分交易
      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          type: 'usage',
          amount: -agent.basePrice,
          balanceAfter: currentUser.credits - agent.basePrice,
          description: `购买Agent: ${agent.name}`,
          relatedId: purchase.id,
          relatedType: 'agent_purchase',
        },
      });

      // 增加Agent下载计数
      await tx.agent.update({
        where: { id: params.id },
        data: {
          downloadsCount: {
            increment: 1,
          },
        },
      });

      return purchase;
    });

    await logOperation({
      action: 'AGENT_PURCHASE',
      userId: user.id,
      resourceType: 'agent',
      resourceId: params.id,
      details: { price: agent.basePrice },
    });

    return NextResponse.json({
      success: true,
      purchase: result,
    });

  } catch (error) {
    console.error("Agent purchase error:", error);
    return NextResponse.json(
      { error: "购买失败" },
      { status: 500 }
    );
  }
}
```

#### 🎨 创意工作坊API (优先级: 中)

**1. 项目管理API**
```typescript
// app/api/workshop/projects/route.ts
export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
  const status = searchParams.get('status');
  const type = searchParams.get('type');

  const skip = (page - 1) * limit;

  const where: any = {
    userId: user.id,
  };

  if (status) where.status = status;
  if (type) where.type = type;

  try {
    const [projects, total] = await Promise.all([
      prisma.creativeProject.findMany({
        where,
        include: {
          versions: {
            where: { isCurrent: true },
            take: 1,
          },
          _count: {
            select: {
              versions: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.creativeProject.count({ where }),
    ]);

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json(
      { error: "获取项目列表失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await request.json();
  const schema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().optional(),
    type: z.enum(['text', 'image', 'video', 'audio', 'mixed']),
    visibility: z.enum(['private', 'team', 'public']).default('private'),
    config: z.record(z.any()).optional(),
  });

  try {
    const data = schema.parse(body);

    const project = await prisma.creativeProject.create({
      data: {
        ...data,
        userId: user.id,
        status: 'draft',
      },
    });

    await logOperation({
      action: 'PROJECT_CREATE',
      userId: user.id,
      resourceType: 'project',
      resourceId: project.id,
      details: { title: data.title, type: data.type },
    });

    return NextResponse.json(project, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "输入数据无效", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "创建项目失败" },
      { status: 500 }
    );
  }
}
```

**2. AI生成API**
```typescript
// app/api/workshop/generate/route.ts
export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await request.json();
  const schema = z.object({
    agentId: z.string().uuid(),
    projectId: z.string().uuid().optional(),
    inputData: z.record(z.any()),
    config: z.record(z.any()).optional(),
  });

  try {
    const { agentId, projectId, inputData, config } = schema.parse(body);

    // 检查Agent是否可用
    const agent = await prisma.agent.findFirst({
      where: {
        id: agentId,
        status: 'published',
      },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agent不存在或不可用" },
        { status: 404 }
      );
    }

    // 检查用户是否有权限使用该Agent
    if (agent.priceType !== 'free') {
      const purchase = await prisma.userAgentPurchase.findFirst({
        where: {
          userId: user.id,
          agentId,
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } },
          ],
        },
      });

      if (!purchase) {
        return NextResponse.json(
          { error: "您还未购买该Agent" },
          { status: 403 }
        );
      }
    }

    // 检查积分余额（按次计费）
    if (agent.priceType === 'pay_per_use') {
      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { credits: true },
      });

      if (!currentUser || currentUser.credits < agent.creditsPerUse) {
        return NextResponse.json(
          { error: "积分不足" },
          { status: 400 }
        );
      }
    }

    // 创建使用记录
    const usageLog = await prisma.agentUsageLog.create({
      data: {
        userId: user.id,
        agentId,
        projectId,
        inputData,
        configUsed: config || agent.defaultConfig,
        status: 'pending',
      },
    });

    // 调用AI服务生成内容
    const startTime = Date.now();

    try {
      // 这里调用具体的AI服务
      const result = await callAIService(agent, inputData, config);

      const processingTime = Date.now() - startTime;

      // 更新使用记录
      const updatedLog = await prisma.agentUsageLog.update({
        where: { id: usageLog.id },
        data: {
          status: 'completed',
          outputData: result,
          processingTimeMs: processingTime,
          creditsUsed: agent.creditsPerUse || 0,
          completedAt: new Date(),
        },
      });

      // 扣除积分（如果是按次计费）
      if (agent.priceType === 'pay_per_use') {
        await prisma.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: user.id },
            data: {
              credits: {
                decrement: agent.creditsPerUse,
              },
            },
          });

          await tx.creditTransaction.create({
            data: {
              userId: user.id,
              type: 'usage',
              amount: -agent.creditsPerUse,
              balanceAfter: (await tx.user.findUnique({
                where: { id: user.id },
                select: { credits: true }
              }))!.credits,
              description: `使用Agent: ${agent.name}`,
              relatedId: updatedLog.id,
              relatedType: 'agent_usage',
            },
          });
        });
      }

      await logOperation({
        action: 'AI_GENERATE',
        userId: user.id,
        resourceType: 'agent',
        resourceId: agentId,
        details: {
          projectId,
          processingTime,
          creditsUsed: agent.creditsPerUse || 0,
        },
      });

      return NextResponse.json({
        success: true,
        result,
        usageId: updatedLog.id,
        processingTime,
      });

    } catch (aiError) {
      // AI服务调用失败，更新使用记录
      await prisma.agentUsageLog.update({
        where: { id: usageLog.id },
        data: {
          status: 'failed',
          errorMessage: String(aiError),
          completedAt: new Date(),
        },
      });

      console.error("AI service error:", aiError);
      return NextResponse.json(
        { error: "AI生成失败，请稍后重试" },
        { status: 500 }
      );
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "输入数据无效", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Generate content error:", error);
    return NextResponse.json(
      { error: "生成内容失败" },
      { status: 500 }
    );
  }
}
```

#### 💳 支付系统API (优先级: 中)

**1. 积分充值API**
```typescript
// app/api/payments/credits/purchase/route.ts
export async function POST(request: Request) {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await request.json();
  const schema = z.object({
    packageId: z.string(),
    paymentMethod: z.enum(['alipay', 'wechat']),
    returnUrl: z.string().url().optional(),
  });

  try {
    const { packageId, paymentMethod, returnUrl } = schema.parse(body);

    // 获取积分套餐信息
    const creditPackage = await getCreditPackage(packageId);
    if (!creditPackage) {
      return NextResponse.json(
        { error: "套餐不存在" },
        { status: 404 }
      );
    }

    // 生成订单号
    const orderNo = generateOrderNumber();

    // 创建订单
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        orderNo,
        type: 'credits_purchase',
        totalAmount: creditPackage.price,
        currency: 'CNY',
        creditsAmount: creditPackage.credits,
        status: 'pending',
        paymentMethod,
        items: [creditPackage],
      },
    });

    // 调用支付接口
    let paymentUrl: string;

    switch (paymentMethod) {
      case 'alipay':
        paymentUrl = await createAlipayOrder(order, returnUrl);
        break;
      case 'wechat':
        paymentUrl = await createWeChatPayOrder(order, returnUrl);
        break;
      default:
        throw new Error('不支持的支付方式');
    }

    await logOperation({
      action: 'ORDER_CREATE',
      userId: user.id,
      resourceType: 'order',
      resourceId: order.id,
      details: {
        orderNo,
        amount: creditPackage.price,
        credits: creditPackage.credits,
        paymentMethod,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      orderNo,
      paymentUrl,
      amount: creditPackage.price,
      credits: creditPackage.credits,
    });

  } catch (error) {
    console.error("Create credit order error:", error);
    return NextResponse.json(
      { error: "创建订单失败" },
      { status: 500 }
    );
  }
}
```

**2. 支付回调API**
```typescript
// app/api/payments/webhooks/alipay/route.ts
export async function POST(request: Request) {
  try {
    const body = await request.text();
    const params = new URLSearchParams(body);

    // 验证支付宝签名
    const isValid = await verifyAlipaySignature(params);
    if (!isValid) {
      return new Response('FAIL', { status: 400 });
    }

    const tradeStatus = params.get('trade_status');
    const outTradeNo = params.get('out_trade_no'); // 我们的订单号
    const tradeNo = params.get('trade_no'); // 支付宝交易号
    const totalAmount = parseFloat(params.get('total_amount') || '0');

    if (tradeStatus === 'TRADE_SUCCESS') {
      // 查找订单
      const order = await prisma.order.findUnique({
        where: { orderNo: outTradeNo },
        include: { user: true },
      });

      if (!order) {
        console.error('Order not found:', outTradeNo);
        return new Response('FAIL', { status: 400 });
      }

      if (order.status === 'paid') {
        // 订单已处理
        return new Response('SUCCESS');
      }

      // 验证金额
      if (Math.abs(totalAmount - Number(order.totalAmount)) > 0.01) {
        console.error('Amount mismatch:', {
          expected: order.totalAmount,
          received: totalAmount,
        });
        return new Response('FAIL', { status: 400 });
      }

      // 处理支付成功
      await prisma.$transaction(async (tx) => {
        // 更新订单状态
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'paid',
            paidAt: new Date(),
            paymentId: tradeNo,
            paymentData: Object.fromEntries(params.entries()),
          },
        });

        // 增加用户积分
        await tx.user.update({
          where: { id: order.userId },
          data: {
            credits: {
              increment: order.creditsAmount,
            },
          },
        });

        // 记录积分交易
        await tx.creditTransaction.create({
          data: {
            userId: order.userId,
            type: 'purchase',
            amount: order.creditsAmount,
            balanceAfter: order.user.credits + order.creditsAmount,
            description: `充值积分 - 订单${order.orderNo}`,
            relatedId: order.id,
            relatedType: 'order',
          },
        });
      });

      // 发送成功通知
      await sendPaymentSuccessNotification(order);

      await logOperation({
        action: 'PAYMENT_SUCCESS',
        userId: order.userId,
        resourceType: 'order',
        resourceId: order.id,
        details: {
          orderNo: outTradeNo,
          amount: totalAmount,
          credits: order.creditsAmount,
          tradeNo,
        },
      });
    }

    return new Response('SUCCESS');

  } catch (error) {
    console.error('Alipay webhook error:', error);
    return new Response('FAIL', { status: 500 });
  }
}
```

### 🔧 工具函数和中间件

#### 认证中间件
```typescript
// lib/auth.ts
export async function getCurrentUser(request: Request): Promise<User | null> {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) return null;

    const payload = await verifyJWTToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
        status: 'active',
      },
    });

    return user;
  } catch {
    return null;
  }
}

export function requireAuth(handler: any) {
  return async (request: Request, ...args: any[]) => {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    return handler(request, ...args);
  };
}

export function requireRole(role: string) {
  return function(handler: any) {
    return async (request: Request, ...args: any[]) => {
      const user = await getCurrentUser(request);
      if (!user || user.role !== role) {
        return NextResponse.json({ error: "权限不足" }, { status: 403 });
      }

      return handler(request, ...args);
    };
  };
}
```

### 📋 后端开发步骤

#### 阶段1: 基础设施搭建 (1周)
1. 设置Prisma和数据库连接
2. 实现认证中间件
3. 设置日志系统
4. 配置文件上传服务

#### 阶段2: 核心API开发 (3-4周)
1. 认证系统API (1周)
2. Agent管理API (1.5周)
3. 创意工作坊API (1周)
4. 支付系统API (0.5周)

#### 阶段3: 高级功能 (2周)
1. 管理员API
2. 通知系统
3. 统计分析API
4. 搜索优化

#### 阶段4: 测试和优化 (1周)
1. API测试
2. 性能优化
3. 安全审计
4. 文档完善