<template>
  <section class="app-container">
    <el-dropdown>
      <el-button type="primary">
        选择店铺
        <i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown">
        <template v-for="item in restaurants">
          <el-dropdown-item :key="item.id" @click.native="selectResturant(item.id)">{{item.name}}</el-dropdown-item>
        </template>
      </el-dropdown-menu>
    </el-dropdown>
    <el-row>
      <el-col :span="16">
        <div id="myChart" :style="{width: '800px', height: '500px'}"></div>
      </el-col>
      <el-col :span="8">
        <div id="myChart1" :style="{width: '400px', height: '400px'}"></div>
      </el-col>
    </el-row>
  </section>
</template>

<script>
import { getRestaurantNodes } from "@/api/dishMenu";
import { getOrderReport, getOrderExpend, getOrderPayType } from "@/api/order";

export default {
  data() {
    return {
      msg: "Welcome to Your Vue.js App",
      restaurants: [],
      orderReport: [],
      expendReport: [],
      payTypes: []
    };
  },
  mounted() {
    this.getRestaurants();
  },
  methods: {
    selectResturant(restaurantId) {
      this.restaurantId = restaurantId;
      this.getOrders(restaurantId);
      this.getExpends(restaurantId);
      this.getPayTypes(restaurantId);
    },
    getRestaurants() {
      getRestaurantNodes().then(res => (this.restaurants = res));
    },
    getOrders(restaurantId) {
      getOrderReport(restaurantId).then(res => {
        this.orderReport = res;
        this.drawLine();
      });
    },
    getExpends(restaurantId) {
      getOrderExpend(restaurantId).then(res => {
        this.expendReport = res;
        this.drawLine();
      });
    },
    getPayTypes(restaurantId) {
      getOrderPayType(restaurantId).then(res => {
        this.payTypes = res;
        this.drawCircle();
      });
    },
    drawCircle() {
      let myChart = this.$echarts.init(document.getElementById("myChart1"));
      myChart.setOption({
        title: {
          text: "支付类型",
          x: "center"
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
          orient: "vertical",
          x: "left",
          data: ["支付宝", "微信", "现金", "其他"]
        },
        toolbox: {
          show: true,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            magicType: {
              show: true,
              type: ["pie", "funnel"],
              option: {
                funnel: {
                  x: "25%",
                  width: "50%",
                  funnelAlign: "left",
                  max: 1548
                }
              }
            },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        calculable: true,
        series: [
          {
            name: "访问来源",
            type: "pie",
            radius: "55%",
            center: ["50%", "60%"],
            data: this.payTypes
          }
        ]
      });
    },
    drawLine() {
      // 基于准备好的dom，初始化echarts实例
      let myChart = this.$echarts.init(document.getElementById("myChart"));
      // 绘制图表
      myChart.setOption({
        title: {
          text: "收入/支出"
        },
        tooltip: {
          trigger: "axis"
        },
        legend: {
          data: ["收入", "支出"]
        },
        toolbox: {
          show: true,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ["line", "bar"] },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        calculable: true,
        xAxis: [
          {
            type: "category",
            data: [
              "1月",
              "2月",
              "3月",
              "4月",
              "5月",
              "6月",
              "7月",
              "8月",
              "9月",
              "10月",
              "11月",
              "12月"
            ]
          }
        ],
        yAxis: [
          {
            type: "value"
          }
        ],
        series: [
          {
            name: "收入",
            type: "bar",
            data: this.orderReport,
            markLine: {
              data: [{ type: "average", name: "平均值" }]
            }
          },
          {
            name: "支出",
            type: "bar",
            data: this.expendReport,
            markLine: {
              data: [{ type: "average", name: "平均值" }]
            }
          }
        ]
      });
    }
  }
};
</script>