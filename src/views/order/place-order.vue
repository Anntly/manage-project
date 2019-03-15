<template>
  <section class="app-container">
    <el-row>
      <el-col :span="12">
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
      </el-col>
      <el-col :span="10">
        <el-select v-model="selectMenu" clearable filterable placeholder="请选择菜单">
          <el-option
            v-for="item in menus"
            :disabled="menuShow"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </el-col>
    </el-row>
    <el-row>
      <!--商品展示-->
      <el-col :span="13">
        <div class="often-goods">
          <div class="title">推荐菜品</div>
          <div class="often-goods-list">
            <ul>
              <li v-for="food in recommendedFoods" :key="food.id" @click="addOrderList(food)">
                <img :src="food.pic" min-width="70" height="70">
                <div>
                  菜名:{{food.showName}}
                </div>
                <div class="bottom clearfix">
                  <div>价格: {{food.price}}元</div>
                  <div>折扣: {{food.discount/100}}</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </el-col>
      <el-col :span="10" class="pos-order" id="order-list">
        <el-tabs>
          <el-tab-pane label="点餐">
            <el-table :data="tableData" border style="width: 100%">
              <el-table-column prop="foodId" label="Id"></el-table-column>
              <el-table-column prop="name" label="商品"></el-table-column>
              <el-table-column prop="amount" label="量" width="50"></el-table-column>
              <el-table-column prop="price" label="金额" width="70"></el-table-column>
              <el-table-column prop="salePrice" label="折扣价" width="70"></el-table-column>
              <el-table-column label="操作" width="100" fixed="right">
                <template slot-scope="scope">
                  <el-button type="text" size="small" @click="delSingleGoods(scope.row)">删除</el-button>
                  <el-button type="text" size="small" @click="countPlus(scope.row.foodId)">增加</el-button>
                </template>
              </el-table-column>
            </el-table>

            <div class="totalDiv">
              <small>数量：</small>
              <strong>{{totalCount}}</strong> &nbsp;&nbsp;&nbsp;&nbsp;
              <small>总计：</small>
              <strong>{{totalMoney}}</strong> 元
            </div>

            <div class="order-btn">
              <el-button type="warning" @click="placeOrder()">挂单</el-button>
              <el-button type="danger" @click="delAllGoods()">删除</el-button>
            </div>
          </el-tab-pane>

          <el-tab-pane label="挂单">挂单</el-tab-pane>
          <el-tab-pane label="外卖">外卖</el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="15">
        <el-tabs tab-position="left">
          <el-tab-pane v-for="cat in cats" :key="cat.id" :label="cat.name">
            <ul class="cookList">
              <li v-for="food in cat.orderFoods" :key="food.id" @click="addOrderList(food)">
                <img :src="food.pic" min-width="70" height="70">
                <div>
                  菜名:
                  {{food.showName}}
                </div>
                <div class="bottom clearfix">
                  <div>价格: {{food.price}}元</div>
                  <div>折扣: {{food.discount/100}}</div>
                </div>
              </li>
            </ul>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
    <el-dialog title="餐桌选择" :visible.sync="dialogFormVisible">
      <el-form :model="orderForm">
        <el-form-item label="选择餐桌" label-width="120px">
          <el-select v-model="orderForm.deskId" clearable filterable placeholder="请选择餐桌">
            <el-option
              v-for="item in desks"
              :key="item.id"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="orderForm.note"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="takeOrder()">确 定</el-button>
      </div>
    </el-dialog>
  </section>
</template>
<script>
import {
  getRestaurantNodes,
  getMenuNodes,
  getOrderNodes,
  getRecommendedFoods
} from "@/api/dishMenu";
import { addOrder } from "@/api/order";
import { getDeskNodes } from "@/api/restaurant";
import QS from "qs";

export default {
  name: "PlaceOrder",
  data() {
    return {
      menuShow: true,
      selectMenu: null,
      menus: [],
      restaurants: [],
      recommendedFoods: [],
      cats: [],
      tableData: [],
      restaurantId: 42,
      restaurantName: "黄焖鸡",
      note: "",
      totalCount: 0,
      totalMoney: 0,
      desks: [],
      dialogFormVisible: false,
      note: "",
      orderForm: {
        deskId: null,
        deskName: null,
        note: null,
        orderDetails: '',
        restaurantId: null,
        restaurantName: null
      }
    };
  },
  methods: {
    getDesks(restaurantId) {
      getDeskNodes(restaurantId).then(res => {
        this.desks = res;
      });
    },
    // 获取推荐菜品
    getRecommended(menuId) {
      getRecommendedFoods(menuId).then(res => {
        this.recommendedFoods = res;
      });
    },
    //获取分类和菜品
    getFoods(menuId) {
      getOrderNodes(menuId).then(res => {
        this.cats = res;
      });
    },
    // 获取菜单列表
    getMenus(restaurantId) {
      getMenuNodes(restaurantId).then(res => {
        this.menus = res;
      });
    },
    selectResturant(restaurantId) {
      this.restaurantId = restaurantId;
      // 获取菜单
      this.getMenus(restaurantId);
      this.getDesks(restaurantId);
      this.menuShow = false;
    },
    getRestaurants() {
      getRestaurantNodes().then(res => (this.restaurants = res));
    },
    addOrderList(food) {
      // 遍历tableData 如果有相等的
      let isHave = false;
      for (let i = 0; i < this.tableData.length; i++) {
        if (this.tableData[i].foodId === food.id) {
          isHave = true; // 存在
        }
      }
      // 根据isHave的值判断订单列表中是否已经有此商品
      if (isHave) {
        // 存在就进行数量添加
        const arr = this.tableData.filter(o => o.foodId === food.id);
        arr[0].amount++;
        this.getAllMoney();
      } else {
        // 不存在就推入数组
        const newGoods = {
          foodId: food.id,
          name: food.showName,
          price: food.price,
          salePrice: (food.price * food.discount) / 100,
          amount: 1
        };
        this.tableData.push(newGoods);
        this.getAllMoney();
      }
    },
    countPlus(foodId) {
      const arr = this.tableData.filter(o => o.foodId === foodId);
      arr[0].amount++;
      this.getAllMoney();
    },
    delAllGoods() {
      this.tableData = [];
      this.totalCount = 0;
      this.totalMoney = 0;
    },
    // 汇总数量和金额
    getAllMoney() {
      this.totalCount = 0;
      this.totalMoney = 0;
      if (this.tableData) {
        this.tableData.forEach(element => {
          this.totalCount += element.amount;
          this.totalMoney =
            this.totalMoney + element.salePrice * element.amount;
        });
      }
    },
    // 点击挂单
    placeOrder() {
      // 显示餐桌选择
      this.dialogFormVisible = true;
    },
    // 下单
    takeOrder() {
      this.orderForm.orderDetails = JSON.stringify(this.tableData);
      this.orderForm.restaurantId = this.restaurantId;
      for (let i = 0; i < this.desks.length; i++) {
        if (this.orderForm.deskId === this.desks[i].value) {
          this.orderForm.deskName = this.desks[i].label;
        }
      }
      for (let i = 0; i < this.restaurants.length; i++) {
        if (this.restaurants[i].value === this.restaurantId) {
          this.orderForm.restaurantName = this.restaurants[i].label;
        }
      }
      

      this.$confirm("确认提交吗？", "提示", {})
        .then(() => {
           const para = Object.assign({}, this.orderForm);
           //const para = JSON.stringify(this.orderForm)
          // console.log(para);
          addOrder(para).then(res => {
            this.$message({
              message: "提交成功",
              type: "success"
            });
            this.delAllGoods();
            this.dialogFormVisible = false;
          });
        })
        .catch(e => {
          // 打印一下错误
          console.log(e);
        });
    }
  },
  created() {},
  mounted() {
    this.getRestaurants();
  },
  watch: {
    selectMenu: function(val) {
      if (val !== null) {
        // 查询 才菜品
        this.getFoods(val);
        this.getRecommended(val);
      }
    }
  }
};
</script>
<style scoped>
.bottom {
  font-size: 12px;
  margin-top: 7px;
  line-height: 10px;
}

.button {
  padding: 0;
  float: right;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}
.often-goods-list {
  border-bottom: 1px solid #c0ccda;
  height: auto;
  overflow: hidden;
  padding-bottom: 10px;
  background-color: #f9fafc;
}
.often-goods-list ul li {
  list-style: none;
  float: left;
  border: 1px solid #e5e9f2;
  padding: 20px;
  margin: 5px;
  background-color: #fff;
  cursor: pointer;
}
.cookList li {
  list-style: none;
  width: 23%;
  border: 1px solid #e5e9f2;
  height: auot;
  overflow: hidden;
  background-color: #fff;
  padding: 2px;
  float: left;
  margin: 2px;
  cursor: pointer;
}
.cookList li span {
  display: block;
  float: left;
}
</style>
