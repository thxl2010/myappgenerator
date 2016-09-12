# 项目架构及自动化创建

# 1. 创建项目：Express 应用生成器

<section class="content">    
<h1 id="express-">Express 应用生成器</h1>

<p>通过应用生成器工具 <code>express</code> 可以快速创建一个应用的骨架。</p>

<p>通过如下命令安装：</p>

<pre class="language-sh"><code class="language-sh">$ npm install express-generator -g
</code></pre>

<p><code>-h</code> 选项可以列出所有可用的命令行选项：</p>

<pre class="language-sh"><code class="language-sh">$ express -h

  Usage: express [options] [dir]

  Options:

    -h, --help          output usage information
    -V, --version       output the version number
    -e, --ejs           add ejs engine support (defaults to jade)
        --hbs           add handlebars engine support
    -H, --hogan         add hogan.js engine support
    -c, --css &lt;engine&gt;  add stylesheet &lt;engine&gt; support (less|stylus|compass|sass) (defaults to plain css)
        --git           add .gitignore
    -f, --force         force on non-empty directory
</code></pre>

<p>例如，下面的示例就是在当前工作目录下创建一个命名为 <em>myapp</em> 的应用。</p>

<pre class="language-sh"><code class="language-sh">$ express myapp

   create : myapp
   create : myapp/package.json
   create : myapp/app.js
   create : myapp/public
   create : myapp/public/javascripts
   create : myapp/public/images
   create : myapp/routes
   create : myapp/routes/index.js
   create : myapp/routes/users.js
   create : myapp/public/stylesheets
   create : myapp/public/stylesheets/style.css
   create : myapp/views
   create : myapp/views/index.jade
   create : myapp/views/layout.jade
   create : myapp/views/error.jade
   create : myapp/bin
   create : myapp/bin/www
</code></pre>

<p>然后安装所有依赖包：</p>

<pre class="language-sh"><code class="language-sh">$ cd myapp 
$ npm install
</code></pre>

<p>启动这个应用（MacOS 或 Linux 平台）：</p>

<pre class="language-sh"><code class="language-sh">$ DEBUG=myapp npm start
</code></pre>

<p>Windows 平台使用如下命令：</p>

<pre class="language-sh"><code class="language-sh">&gt; set DEBUG=myapp &amp; npm start
</code></pre>

<p>然后在浏览器中打开 <code>http://localhost:3000/</code> 网址就可以看到这个应用了。i</p>

<p>通过 Express 应用生成器创建的应用一般都有如下目录结构：</p>

<pre class="language-sh"><code class="language-sh">.
├── app.js
├── bin
│&nbsp;&nbsp; └── www
├── package.json
├── public
│&nbsp;&nbsp; ├── images
│&nbsp;&nbsp; ├── javascripts
│&nbsp;&nbsp; └── stylesheets
│&nbsp;&nbsp;     └── style.css
├── routes
│&nbsp;&nbsp; ├── index.js
│&nbsp;&nbsp; └── users.js
└── views
    ├── error.jade
    ├── index.jade
    └── layout.jade

7 directories, 9 files
</code></pre>

<div class="doc-box doc-info">
  <p>通过 Express 应用生长期创建应用只是众多方法中的一种。你可以不使用它，也可以修改它让它符合你的需求，都是开源的嘛！</p>
</div>
</section>

---------------------------------------------
# 2. 自动化构建

- [gulp.js](http://www.gulpjs.com.cn/) - 基于流的自动化构建工具。

- [Browserify](http://browserify.org/) —— 利用Node.js实现JS模块化加载

- jade浏览器端模板: [jadeify](https://github.com/domenic/jadeify#configuration)
  As with most browserify transforms, you can configure jadeify via the second argument to bundle.transform:                                                             
  `bundle.transform(require("jadeify"), { compileDebug: true, pretty: true });`
  or inside your package.json configuration:
  ```json
  {
      "name": "my-spiffy-package",
      "browserify": {
          "transform": [
              ["jadeify", { "compileDebug": true, "pretty": true }]
          ]
      }
  }
  ```

- [Bower](https://bower.io/) - A package manager for the web  
---------------------------------------------

# 3. 启动
- `npm install`
- `bower install`
- gulp：`gulp builds` || `gulp watch.dev`
- start server：`set DEBUG=myappgenerator & npm start`

# 4. 使用 superagent 与 cheerio 完成简单爬虫
1. 学习使用 superagent 抓取网页
  superagent( http://visionmedia.github.io/superagent/ ) 是个轻量的的 http 方面的库，
  是nodejs里一个非常方便的客户端请求代理模块，当我们需要进行 get 、 post 、 head 等网络请求时，尝试下它吧。
2. 学习使用 cheerio 分析网页
  cheerio( https://github.com/cheeriojs/cheerio ) 大家可以理解成一个 Node.js 版的 jquery，
  用来从网页中以 css selector 取数据，使用方式跟 jquery 一样一样的。
3. eventproxy
   eventproxy( https://github.com/JacksonTian/eventproxy ) 非常轻量的工具，但是能够带来一种事件式编程的思维变化。
   用 js 写过异步的同学应该都知道，如果你要并发异步获取两三个地址的数据，并且要在获取到数据之后，对这些数据一起进行利用的话，
   常规的写法是自己维护一个计数器。先定义一个 var count = 0，然后每次抓取成功以后，就 count++。如果你是要抓取三个源的数据，
   由于你根本不知道这些异步操作到底谁先完成，那么每次当抓取成功的时候，就判断一下count === 3。当值为真时，使用另一个函数继续完成操作。
   而 eventproxy 就起到了这个计数器的作用，它来帮你管理到底这些异步操作是否完成，完成之后，它会自动调用你提供的处理函数，并将抓取到的数据当参数传过来。
  