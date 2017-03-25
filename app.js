import bar from './bar'
//bar();
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
		actionType:'signUp',
		formData:{
			username:'',
			password:''
		},
		newTodo:'',
		todoList:[]
	},
	created:function(){
		//onbeforeunload卸载页面之前
		window.onbeforeunload = ()=>{
			// 使用 JSON.stringify 把数组转换为 JSON 字符串
			let dataString = JSON.stringify(this.todoList)
			window.localStorage.setItem('myTodos',dataString)
		}
		let oldDataString = window.localStorage.getItem('myTodos')
		//JSON.parse() 方法解析一个JSON字符串
		let oldData = JSON.parse(oldDataString)
		//|| [] 这个也是关键
		this.todoList = oldData || []
	},
	methods:{
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
		},
		removeTodo:function(todo){
			let index = this.todoList.indexOf(todo)
			this.todoList.splice(index,1)
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
		signUp:function(){
			let user =new AV.User()
			user.setUsername(this.formData.username)
			user.setPassword(this.formData.password)
			user.signUp().then(function(loginedUser){
				console.log(loginedUser)
			},function(error){

			})
		}
	}
})