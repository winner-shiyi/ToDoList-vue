import style from './style.css'
import Vue from 'vue'
import AV from 'leancloud-storage'

var APP_ID = 'WhfLfN9drHubYfXs3SERLo1m-gzGzoHsz';
var APP_KEY = '4fjSbgQaxdBF676IO57O3QNj';
AV.init({
  appId: APP_ID,
  appKey: APP_KEY
});

var app = new Vue({
	el:'#app',
	data:{
		newTodo:'',
		todoList:[],
		actionType:'signUp',//表单注册登录
		formData:{
			username:'',
			password:''
		},
		currentUser:null
	},
	created:function(){
		this.currentUser = this.getCurrentUser()
		this.fetchTodos()
	},
	methods:{
		fetchTodos:function(){
			if(this.currentUser){
				// 查询某个 AV.Object 实例，之后进行修改
				var query = new AV.Query('AllTodos')
				// find 方法是一个异步方法，会返回一个 Promise，之后可以使用 then 方法
					query.find().then((todos)=> {
						let avAllTodos = todos[0]// 因为理论上 AllTodos 只有一个，所以我们取结果的第一项
						let id = avAllTodos.id
						this.todoList = JSON.parse(avAllTodos.attributes.content)
						this.todoList.id = id
						// 更新成功
						console.log(todos)
					}, function(error){
						// 异常处理
						console.log(error)
				})
			}
		},
		updateTodos:function(){
			//使用 JSON.stringify 把数组转换为 JSON 字符串
			let dataString = JSON.stringify(this.todoList)
			// 第一个参数是 className，第二个参数是 objectId
			let avTodos = AV.Object.createWithoutData('AllTodos', this.todoList.id)
			// 修改属性
			avTodos.set('content', dataString)
			// 保存到云端
			avTodos.save().then(()=>{
				console.log('更新成功')
			})
		},
		saveTodos:function(){

			//使用 JSON.stringify 把数组转换为 JSON 字符串
			let dataString = JSON.stringify(this.todoList)
			// 声明一个 AVTodos 类型
			var AVTodos = AV.Object.extend('AllTodos')
			// 新建一个 avTodos 对象
			var avTodos = new AVTodos()
			// 新建一个 ACL 实例
			var acl = new AV.ACL()
			acl.setReadAccess(AV.User.current(),true) // 只有这个 user 能读
			acl.setWriteAccess(AV.User.current(),true) // 只有这个 user 能写

			avTodos.set('content', dataString)

			avTodos.setACL(acl) // 设置访问控制

			avTodos.save().then((todo)=>{
				//一定要记得把 id 挂到 this.todoList 上，否则下次就不会调用 updateTodos 了
				this.todoList.id = todo.id
			  	console.log('保存成功')
			},function(error){
			  	console.log('保存失败')
			})
		},
		saveOrUpdateTodos:function(){
			if(this.todoList.id){
				this.updateTodos()
			}else{
				this.saveTodos()
			}
		},
		addTodo:function(){
			if(!/\S/g.test(this.newTodo)){
				alert('输入内容不能为空')
				return
			}
			this.todoList.push({
				title:this.newTodo,
				createdAt:this.formatTime(),
				done:false
			})
			this.newTodo = ''
			this.saveOrUpdateTodos() // 不能用 saveTodos 了
		},
		removeTodo:function(todo){
			let index = this.todoList.indexOf(todo)
			this.todoList.splice(index,1)
			this.saveOrUpdateTodos() // 不能用 saveTodos 了
		},
		formatTime:function(){
		    let dt = new Date(),
		        yy = dt.getFullYear(),
		        mm = dt.getMonth()+1,
		        dd = dt.getDate(),
		        hh = dt.getHours(),
		        ms = dt.getMinutes(),
		        dtArray = []
		    dtArray.push(yy,mm,dd,hh,ms)
		    for(var i=0;i<dtArray.length;i++){
		        if(dtArray[i]<10){
		            dtArray[i] = '0'+ dtArray[i]
		        }
		    }
		    let tpl = dtArray[0] +'年'+ dtArray[1] +'月'+ dtArray[2] +'日 '+ dtArray[3] +':'+ dtArray[4]
		    return tpl
		},
		clearAll:function(){
		    this.todoList = []
		},
		toggleFinish:function(todo){
			todo.done = !todo.done
			this.saveOrUpdateTodos()
		},
		signUp:function(){
			let user =new AV.User()
			user.setUsername(this.formData.username)
			user.setPassword(this.formData.password)

			user.signUp().then((loginedUser) =>{//将 function 改成箭头函数，方便使用 this
				this.currentUser = this.getCurrentUser()
			},function(error){
				alert('注册失败，请重试~')
			})
		},
		login:function(){
			AV.User.logIn(this.formData.username,this.formData.password).then((loginedUser) =>{
			    this.currentUser = this.getCurrentUser()
			    this.fetchTodos()// 登录成功后读取 todos
			  }, function (error) {
			  	alert('登录失败，请重试~')
			})
		},
		getCurrentUser:function(){
			let current = AV.User.current()
			if(current){
				//解构赋值
				let {id,createdAt,attributes: {username}} = current
				return {id, username, createdAt}
			}else{
				return null
			}
		},
		logout:function(){
			AV.User.logOut()
			this.currentUser = null
			window.location.reload()//退出的时候为啥要刷新页面
		}
	}
})
