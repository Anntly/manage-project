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
    <div id="myChart" :style="{width: '800px', height: '500px'}"></div>
  </section>
</template>

<script>
import { getRestaurantNodes } from "@/api/dishMenu";
import { getFoodReportNode } from "@/api/order";

export default {
  data() {
    return {
      msg: "Welcome to Your Vue.js App",
      restaurants: [],
      foods: null
    };
  },
  mounted() {
    this.getRestaurants();
  },
  methods: {
     getFoods(restaurantId) {
      getFoodReportNode(restaurantId).then(res => {
        this.foods = res;
        this.drawLine();
      });
    },
    selectResturant(restaurantId) {
      this.restaurantId = restaurantId;
      this.getFoods(restaurantId)
    },
    getRestaurants() {
      getRestaurantNodes().then(res => (this.restaurants = res));
    },
    drawLine() {
      // 基于准备好的dom，初始化echarts实例
      let myChart = this.$echarts.init(document.getElementById("myChart"));
      // 绘制图表
      myChart.setOption({
        title: {
          text: "菜品销量排行(前10)"
        },
        tooltip: {
          trigger: "axis"
        },
        legend: {
          data: ["菜品"]
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
            type: "value",
            boundaryGap: [0, 0.01]
          }
        ],
        yAxis: [
          {
            type: "category",
            data: this.foods.name.reverse()
          }
        ],
        series: [
          {
            name: "菜品",
            type: "bar",
            data: this.foods.num.reverse()
          }
        ]
      });
    }
  }
};
</script>