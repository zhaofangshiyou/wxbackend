# 项目概述
本项目使用 koa2 web 框架，MySQL 数据库，Redis 数据库，搭载 Nginx 反向代理，
用于后期处理负载均衡，使用 Docker 配置相应的环境，使用 restful api 设计风格。
Mysql 数据库 ORM 框架 sequelize。各个文件开头有相应的介绍与创建时间，相应的功
能模块有相应的注释。如若新建文件与新加功能，请标明创建时间与创建人员，相应的功能
模拟块请添加注释在开发环境下，当你有代码修改的时候，pm2 模块会自动重启应用，在线
上环境下，不会自动重启应用

restful api
```
http://www.ruanyifeng.com/blog/2014/05/restful_api.html
```
sequelize
```
http://docs.sequelizejs.com/
https://itbilu.com/nodejs/npm/V1PExztfb.html#definition-dataType

```

# 项目启动文件
- 工作目录
```
/usr/local/work/
```
- 启动 Docker 各个容器
```
work-path:/usr/local/work/docker-compose/
docker-compose up -d
```

- 关闭 Docker 各个容器
```
work-path:/usr/local/work/docker-compose/
docker-compose stop
```

- 启动项目
```
pm2 start entry.config.js --env production
pm2 start entry.config.js --env development
```

# 项目 request 与 response
request -- 增删改查
```
post - 增
delete - 删
put - 改
get - 查
```

response
```
    {
        status: 0
        , msg: "success"
        , data: {
            station: newStation
    }
```


# 数据库配置
- MySQL
- Redis


```
测试数据库：
ip：123.207.242.77
Mysql：
        user：root
        password：123qweasd！
        db：zfdb
        port：4407
MongoDB：
        user：zf
        password：123qweasd！
        db：zfdb
        port：37017
Redis：
        port：6378
```
建议开发期间使用相应的 GUI 工具，Mysql -- Navicat、Redis -- Medis


# 模块说明
```
Base path：/usr/local/work
```
- /entry.config.js
```
项目启动文件
```

- /docker-compose/mongo-entrypoint/add-mongo-user.sh
```
MongoDB 添加用户
```

- /docker-compose/docker-compose
```
docker 配置文件
```

- /docker-compose/
```
nginx 配置文件
```

- /zf_xcx/bin/

```
启动文件
```

- /zf_xcx/config
```
各种配置文件，数据库配置、阿里云短信配置文件、小程序配置文件等
```

- /zf_xcx/db
```
数据库连接文件
```

- /zf_xcx/models
```
数据库表，
MySQL 数据库使用 sequelize ORM 库，
相关文档地址：
http://docs.sequelizejs.com/
https://itbilu.com/nodejs/npm/V1PExztfb.html#definition-dataType
MongoDB 数据库使用 mongoose ORM 库，本项目未启用 MongoDB 数据库
```

- /zf_xcx/node_modules
```
依赖库文件
```

- /zf_xcx/public
```
资源文件。例如：images、css、js等
```

- /zf_xcx/routes
```
路由文件
```

- /zf_xcx/views
```
渲染视图文件
```

- /zf_xcx/app.js
```
项目的起始文件，引用各类第三方库，路由，错误处理，body 解析
```

# 命名规范
- 类名、枚举

```
  ClassNameLikeThis
  
  EnumNameLikeThis
```
  
- 常量

```
CONSTANTS_LIKE_THIS
```
  
- 文件名

```
document_name_like_this.js
```
  
- 变量
```
likeThis
```
