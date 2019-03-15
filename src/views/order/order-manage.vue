<template>
  <section class="app-container">
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" @submit.native.prevent>
        <el-dropdown>
          <el-button type="primary">
            选择店铺
            <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <template v-for="item in restaurants">
              <el-dropdown-item
                :key="item.id"
                @click.native="selectResturant(item.id)"
              >{{item.name}}</el-dropdown-item>
            </template>
          </el-dropdown-menu>
        </el-dropdown>
        <el-form-item>
          <el-input v-model="filters.id" placeholder="ID"></el-input>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.type" placeholder="请选择订单类型">
            <el-option label="外卖" value="false"></el-option>
            <el-option label="店内点餐" value="true"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>支付金额
          <el-input-number v-model="filters.realPay" :step="10" :precision="2" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.payStatus" placeholder="请选择支付状态">
            <el-option label="未支付" value="false"></el-option>
            <el-option label="已支付" value="true"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select v-model="filters.status" placeholder="请选择订单状态">
            <el-option label="未接单" value="1"></el-option>
            <el-option label="已接单" value="2"></el-option>
            <el-option label="配送中" value="3"></el-option>
            <el-option label="已取消" value="4"></el-option>
            <el-option label="已完成" value="5"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="timeS"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getOrders">查询</el-button>
          <el-button type="danger" v-on:click="getUnPayOrders">快速查询未付款订单</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table
      :data="orders"
      :default-sort="{prop: 'id', order: 'descending'}"
      @sort-change="handleSortChange"
      stripe
      highlight-current-row
      @selection-change="selsChange"
      style="min-width: 100%;"
      v-loading="loading"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" inline class="demo-table-expand">
            <el-form-item label="需要支付价格(/元)">
              <span>{{ props.row.needPay }}</span>
            </el-form-item>
            <el-form-item label="优惠后价格(/元)">
              <span>{{ props.row.realPay }}</span>
            </el-form-item>
            <el-form-item label="收货地址">
              <span>{{ props.row.address }}</span>
            </el-form-item>
            <el-form-item label="配送员Id">
              <span>{{ props.row.courierId }}</span>
            </el-form-item>
            <el-form-item label="配送员名称">
              <span>{{ props.row.courierName }}</span>
            </el-form-item>
            <el-form-item label="优惠券Id">
              <span>{{ props.row.couponsId }}</span>
            </el-form-item>
            <el-form-item label="优惠券名称">
              <span>{{ props.row.couponsName }}</span>
            </el-form-item>
            <el-form-item label="餐盒费(/元)">
              <span>{{ props.row.boxFee }}</span>
            </el-form-item>
            <el-form-item label="配送费(/元)">
              <span>{{ props.row.shippingFee }}</span>
            </el-form-item>
            <el-form-item label="配送方式">
              <span>{{ props.row.deliveryMode?"商家配送":"外卖员配送" }}</span>
            </el-form-item>
            <el-form-item label="上餐时间">
              <span>{{ props.row.deliveryTime }}</span>
            </el-form-item>
            <el-form-item label="创建时间">
              <span>{{ props.row.create_time }}</span>
            </el-form-item>
            <el-form-item label="更新时间">
              <span>{{ props.row.update_time }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>
      <el-table-column fixed sortable="custom" prop="id" label="ID"></el-table-column>
      <el-table-column
        fixed
        prop="type"
        label="订单类型"
        :filters="[{ text: '外卖', value: false },{ text: '店内点餐', value: true }]"
        :filter-method="filterType"
      >
        <template slot-scope="scope">
          <el-tag
            :type="typeCheck(scope.row.type)"
            disable-transitions
            v-html="typeFormatter(scope,scope.row.type)"
          ></el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="restaurantId" label="餐厅Id"></el-table-column>
      <el-table-column prop="restaurantName" label="餐厅名称"></el-table-column>
      <el-table-column prop="userId" label="用户Id"></el-table-column>
      <el-table-column prop="userName" label="用户名称"></el-table-column>
      <el-table-column prop="deskId" label="餐桌Id"></el-table-column>
      <el-table-column prop="deskName" label="餐桌名称"></el-table-column>
      <el-table-column prop="note" label="备注"></el-table-column>
      <el-table-column
        prop="payStatus"
        label="支付状态"
        :filters="[{ text: '未支付', value: false },{ text: '已支付', value: true }]"
        :filter-method="filterPayStatus"
      >
        <template slot-scope="scope">
          <el-tag
            :type="payStatusCheck(scope.row.payStatus)"
            disable-transitions
            v-html="payStatusFormatter(scope,scope.row.payStatus)"
          ></el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="payType"
        label="支付方式"
        :filters="[{ text: '支付宝', value: 1 },{ text: '微信', value: 2 },{ text: '现金', value: 3 },{ text: '其他', value: 4 }]"
        :filter-method="filterPayType"
      >
        <template slot-scope="scope">
          <el-tag
            :type="payTypeCheck(scope.row.payType)"
            disable-transitions
            v-html="payTypeFormatter(scope,scope.row.payType)"
          ></el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="status"
        label="菜单状态"
        :filters="[{ text: '未接单', value: 1 },{ text: '已接单', value: 2 }, { text: '配送中', value: 3 }, { text: '已取消', value: 4 }, { text: '已完成', value: 5 }]"
        :filter-method="filterStatus"
      >
        <template slot-scope="scope">
          <el-tag
            :type="statusCheck(scope.row.status)"
            disable-transitions
            v-html="statusFormatter(scope,scope.row.status)"
          ></el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="350">
        <template slot-scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
          <el-button type="info" size="small" @click="toDetail(scope.$index, scope.row)">订单详情</el-button>
          <el-button
            :disabled="isPay(scope.$index, scope.row)"
            type="primary"
            size="small"
            @click="settlementMoney(scope.$index, scope.row)"
          >结算</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-pagination
        layout="total,prev, pager, next, jumper"
        @current-change="handleCurrentChange"
        :total="this.total"
        :page-size="10"
        style="float:right;"
      ></el-pagination>
    </el-col>

    <!--编辑界面-->
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
        <el-form-item label="ID" prop="id" :disabled="true">
          <el-input v-model="editForm.id" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="订单类型" prop="type">
          <el-switch active-text="店内点餐" inactive-text="外卖" v-model="editForm.type"></el-switch>
        </el-form-item>
        <el-form-item label="餐厅Id" prop="restaurantId">
          <el-input v-model="editForm.restaurantId" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="餐厅名称" prop="restaurantName">
          <el-input v-model="editForm.restaurantName" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="用户Id" prop="userId">
          <el-input v-model="editForm.userId" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="用户名称" prop="userName">
          <el-input v-model="editForm.userName" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="配送员Id" prop="courierId">
          <el-input v-model="editForm.courierId" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="配送员名称" prop="courierName">
          <el-input v-model="editForm.courierName" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="餐桌Id" prop="deskId">
          <el-input v-model="editForm.deskId" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="餐桌名称" prop="deskName">
          <el-input v-model="editForm.deskName" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="优惠券Id" prop="couponsId">
          <el-input v-model="editForm.couponsId" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="优惠券名称" prop="couponsName">
          <el-input v-model="editForm.couponsName" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="用户备注" prop="note">
          <el-input type="textarea" v-model="editForm.note"></el-input>
        </el-form-item>

        <el-form-item label="用户地址" prop="address">
          <el-input v-model="editForm.address"></el-input>
        </el-form-item>
        <el-form-item label="需要支付" prop="needPay">
          <el-input v-model="editForm.needPay"></el-input>
        </el-form-item>
        <el-form-item label="实际支付" prop="realPay">
          <el-input v-model="editForm.realPay"></el-input>
        </el-form-item>
        <el-form-item label="支付状态" prop="payStatus">
          <el-switch active-text="已支付" inactive-text="未支付" v-model="editForm.payStatus"></el-switch>
        </el-form-item>
        <el-form-item label="订单状态" prop="status">
          <el-select v-model="editForm.status" placeholder="请选择订单状态">
            <el-option label="未接单" value="1"></el-option>
            <el-option label="已接单" value="2"></el-option>
            <el-option label="配送中" value="3"></el-option>
            <el-option label="已取消" value="4"></el-option>
            <el-option label="已完成" value="5"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="支付方式" prop="payType">
          <el-select v-model="editForm.payType" placeholder="请选择支付方式">
            <el-option label="支付宝" value="1"></el-option>
            <el-option label="微信" value="2"></el-option>
            <el-option label="现金" value="3"></el-option>
            <el-option label="其他" value="4"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="餐盒费" prop="boxFee">
          <el-input-number v-model="editForm.boxFee" :step="0.5" :precision="2" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="配送费" prop="shippingFee">
          <el-input-number v-model="editForm.shippingFee" :step="0.5" :precision="2" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="配送方式" prop="deliveryMode">
          <el-select v-model="editForm.deliveryMode" placeholder="请选择配送方式">
            <el-option label="商家配送" value="1"></el-option>
            <el-option label="外卖员配送" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="到达时间" prop="deliveryTime">
          <el-date-picker v-model="editForm.deliveryTime" type="datetime" placeholder="选择日期"></el-date-picker>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="dialogFormVisible=false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">添加</el-button>
        <el-button v-else type="primary" @click="updateData">修改</el-button>
      </div>
    </el-dialog>
  </section>
</template>
<script>
import { getRestaurantNodes, batchRemoveMenu, addMenu } from "@/api/dishMenu";
import {
  getOrderPage,
  removeOrder,
  editOrder,
  settlement,
  haspay
} from "@/api/order";
import QS from "qs";
import { Message, MessageBox } from "element-ui";

export default {
  name: "OrderManage",
  data() {
    return {
      timeS: [],
      restaurants: [],
      loading: true,
      options: [], // 级联选择器结果
      childrens: [], //所有的子节点
      selectedOptions: [], // 用户 edit时，回显的数据
      textMap: {
        update: "Edit",
        create: "Create"
      },
      dialogFormVisible: false,
      filters: {
        id: null,
        restaurantId: null,
        type: null,
        realPay: null,
        payStatus: null,
        status: null,
        beginTime: null,
        endTime: null
      },
      key: "",
      orders: [],
      total: 0,
      totalPage: 0,
      page: 1,
      sortBy: "",
      desc: false,
      sels: [], // 列表选中列
      editFormRules: {},
      // 编辑界面数据
      editForm: {
        id: 0,
        type: true,
        restaurantId: 0,
        restaurantName: null,
        userId: null,
        userName: null,
        note: null,
        address: null,
        courierId: null,
        courierName: null,
        deskId: null,
        deskName: null,
        couponsId: null,
        couponsName: null,
        needPay: null,
        realPay: null,
        payStatus: null,
        status: null,
        payType: null,
        boxFee: null,
        shippingFee: null,
        deliveryMode: null,
        deliveryTime: null
      },

      addFormVisible: false, // 新增界面是否显示
      addFormRules: {},
      dialogImageUrl: "",
      dialogVisible: false,
      productImgs: [], // 文件列表
      isMultiple: true,
      imgLimit: 1, // 上传文件数量
      dialogStatus: ""
    };
  },
  methods: {
    destroyed: function() {
      // 离开页面生命周期函数
      this.websocketclose();
    },
    collapse: function() {
      this.isCollapse = !this.isCollapse;
      if (this.isCollapse) {
        this.iconClass = "cebianlanzhankai";
      } else {
        this.iconClass = "cebianlanshouhui";
      }
    },
    initWebSocket: function() {
      // WebSocket与普通的请求所用协议有所不同，ws等同于http，wss等同于https
      this.websock = new WebSocket(
        "ws://localhost:8087/websocket/" + this.restaurantId
      );
      this.websock.onopen = this.websocketonopen;
      this.websock.onerror = this.websocketonerror;
      this.websock.onmessage = this.websocketonmessage;
      this.websock.onclose = this.websocketclose;
    },
    websocketonopen: function() {
      console.log("WebSocket连接成功");
    },
    websocketonerror: function(e) {
      console.log("WebSocket连接发生错误");
    },
    websocketonmessage: function(e) {
      var da = JSON.parse(e.data);
      console.log(da);
      Message.success(da);
      this.message = da;
    },
    websocketclose: function(e) {
      console.log("connection closed (" + e.code + ")");
    },

    getUnPayOrders() {
      //昨天的时间
      var day1 = new Date();
      day1.setDate(day1.getDate() - 1);
      //前天的时间
      var day2 = new Date();
      day2.setDate(day2.getDate() - 2);
      this.filters.payStatus = false;
      //this.filters.status = 3;
      this.filters.beginTime = day1;
      this.filters.endTime = day2;
      this.getOrders();
    },
    payMoney(id, price) {
      const h = this.$createElement;
      this.$msgbox({
        title: "消息",
        message: h("p", null, [
          h("span", null, "需支付 "),
          h("i", { style: "color: teal" }, price)
        ]),
        showCancelButton: true,
        confirmButtonText: "已付款",
        cancelButtonText: "取消",
        beforeClose: (action, instance, done) => {
          if (action === "confirm") {
            instance.confirmButtonLoading = true;
            instance.confirmButtonText = "执行中...";
            setTimeout(() => {
              done();
              setTimeout(() => {
                instance.confirmButtonLoading = false;
              }, 300);
            }, 3000);
          } else {
            done();
          }
        }
      }).then(action => {
        haspay(id).then(this.getUnPayOrders());
        Message.success("订单完成");
      });
    },
    settlementMoney(index, row) {
      settlement(row.id)
        .then(res => {
          this.payMoney(row.id, res);
        })
        .catch();
    },

    isPay(index, row) {
      return row.payStatus;
    },
    toDetail(index, row) {
      this.$router.push({
        name: "OrderDetail",
        params: { id: row.id, restaurantId: this.filters.restaurantId }
      });
    },
    selectResturant(restaurantId) {
      this.filters.restaurantId = restaurantId;
      // 开启websocket
      this.initWebSocket();
      this.getOrders();
    },
    filterPayType(value, row) {
      return row.payType === value;
    },
    payTypeCheck(payType) {
      if (payType === 1) {
        return "primary";
      } else if (payType === 2) {
        return "success";
      } else if (payType === 3) {
        return "warning";
      } else {
        return "info";
      }
    },
    payTypeFormatter(row, column) {
      if (row.payType === 1) {
        return "支付宝";
      } else if (row.payType === 2) {
        return "微信";
      } else if (row.payType === 3) {
        return "现金";
      } else {
        return "其他";
      }
    },
    filterPayStatus(value, row) {
      return row.payStatus === value;
    },
    payStatusFormatter(row, column) {
      if (row.payStatus) {
        return "已支付";
      } else {
        return "未支付";
      }
    },
    filterType(value, row) {
      return row.type === value;
    },
    payStatusCheck(payStatus) {
      if (payStatus) {
        return "success";
      } else {
        return "danger";
      }
    },
    typeCheck(type) {
      if (type) {
        return "success";
      } else {
        return "danger";
      }
    },
    typeFormatter(row, column) {
      if (row.type) {
        return "店内点餐";
      } else {
        return "外卖";
      }
    },
    filterStatus(value, row) {
      return row.status === value;
    },
    statusCheck(status) {
      if (status === 1) {
        return "warning";
      } else if (status === 2) {
        return "info";
      } else if (status === 3) {
        return "primary";
      } else if (status === 4) {
        return "danger";
      } else if (status === 5) {
        return "primary";
      }
    },
    statusFormatter(row, status) {
      if (status === 1) {
        return "未接单";
      } else if (status === 2) {
        return "已接单";
      } else if (status === 3) {
        return "配送中";
      } else if (status === 4) {
        return "已取消";
      } else if (status === 5) {
        return "已完成";
      }
    },
    handleRemove(file, fileList) {
      //移除图片
      console.log(file, fileList);
    },
    handlePictureCardPreview(file) {
      //预览图片时调用
      console.log(file);
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },

    beforeAvatarUpload(file) {
      //文件上传之前调用做一些拦截限制
      console.log(file);
      const isJPG = true;
      // const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      // if (!isJPG) {
      //   this.$message.error('上传头像图片只能是 JPG 格式!');
      // }
      if (!isLt2M) {
        this.$message.error("上传图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    handleAvatarSuccess(res, file) {
      //图片上传成功
      this.editForm.pic = res;
    },
    handleExceed(files, fileList) {
      //图片上传超过数量限制
      this.$message.error("上传图片不能超过1张!");
      console.log(file, fileList);
    },
    imgUploadError(err, file, fileList) {
      //图片上传失败调用
      console.log(err);
      this.$message.error("上传图片失败!");
    },
    // 性别显示转换
    formatSex: function(row, column) {
      return row.sex === 1 ? "男" : row.sex === 0 ? "女" : "未知";
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getOrders();
    },
    // 处理filters的数据
    checkObj(para) {
      this.filters.beginTime = this.timeS[0];
      this.filters.endTime = this.timeS[1];
      para.key = JSON.stringify(this.filters);
      getOrderPage(para)
        .then(res => {
          let restaurantId = this.filters.restaurantId;
          this.total = res.total;
          this.totalPage = res.totalPage;
          this.orders = res.items;
          this.loading = false;
          this.filters = {};
          this.filters.restaurantId = restaurantId;
        })
        .catch();
    },
    // 获取用户列表
    getOrders() {
      const para = {
        key: this.filters,
        page: this.page,
        sortBy: this.sortBy,
        desc: this.desc
      };
      this.checkObj(para);
    },
    getRestaurants() {
      getRestaurantNodes().then(res => (this.restaurants = res));
    },
    // 删除
    handleDel(index, row) {
      this.$confirm("确认删除该记录吗?", "提示", {
        type: "warning"
      })
        .then(() => {
          removeOrder(row.id).then(res => {
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getOrders();
          });
        })
        .catch(() => {});
    },
    // 显示编辑界面
    handleEdit(index, row) {
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.editForm = Object.assign({}, row);
    },
    // 显示新增界面
    handleAdd() {
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.editForm = {
        id: 0,
        type: true,
        restaurantId: 0,
        restaurantName: null,
        userId: null,
        userName: null,
        note: null,
        address: null,
        courierId: null,
        courierName: null,
        deskId: null,
        deskName: null,
        couponsId: null,
        couponsName: null,
        needPay: null,
        realPay: null,
        payStatus: null,
        status: null,
        payType: null,
        boxFee: null,
        shippingFee: null,
        deliveryMode: null,
        deliveryTime: null
      };
    },
    // 编辑
    updateData() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {})
            .then(() => {
              const para = Object.assign({}, this.editForm);
              editOrder(para).then(res => {
                this.$message({
                  message: "提交成功",
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.dialogFormVisible = false;
                this.selectedOptions = [];
                this.getOrders();
              });
            })
            .catch(e => {
              // 打印一下错误
              console.log(e);
            });
        }
      });
    },
    // 新增
    createData: function() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {})
            .then(() => {
              const para = Object.assign({}, this.editForm);
              console.log(para);
              addMenu(para).then(res => {
                this.$message({
                  message: "提交成功",
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.dialogFormVisible = false;
                this.getOrders();
              });
            })
            .catch(e => {
              // 打印一下错误
              console.log(e);
            });
        }
      });
    },
    // 全选单选多选
    selsChange(sels) {
      this.sels = sels;
    },
    // 批量删除
    batchRemove() {
      var ids = this.sels.map(item => item.id).toString();
      this.$confirm(
        "确认删除选中记录吗(会删除该菜单下的所有菜品与分类)？",
        "提示",
        {
          type: "warning"
        }
      )
        .then(() => {
          const para = { ids: ids };
          batchRemoveMenu(para).then(res => {
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getOrders();
          });
        })
        .catch(() => {});
    },
    // 排序
    handleSortChange(column) {
      this.sortBy = column.prop;
      this.desc = column.order === "ascending";
      this.getOrders();
    }
  },
  created() {},
  mounted() {
    this.getRestaurants();
  }
};
</script>
<style scoped>
.el-dropdown {
  vertical-align: top;
}
.el-dropdown + .el-dropdown {
  margin-left: 15px;
}
.el-icon-arrow-down {
  font-size: 12px;
}
.demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  width: 90px;
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 50%;
}
</style>
