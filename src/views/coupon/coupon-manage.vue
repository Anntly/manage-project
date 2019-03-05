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
          <el-input v-model="filters.name" placeholder="优惠券名称"></el-input>
        </el-form-item>
        <el-form-item>金额
          <el-input-number v-model="filters.needCost" :step="10" :precision="2" :min="0"></el-input-number>
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
          <el-button type="primary" v-on:click="getCoupons">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
        <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
      </el-form>
    </el-col>

    <!--列表-->
    <el-table
      :data="coupons"
      :default-sort="{prop: 'status', order: 'descending'}"
      @sort-change="handleSortChange"
      stripe
      highlight-current-row
      @selection-change="selsChange"
      style="min-width: 100%;"
      v-loading="loading"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="id" label="ID"></el-table-column>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="description" label="描述"></el-table-column>
      <el-table-column v-if="false" prop="restaurantId" label="餐厅Id"></el-table-column>
      <el-table-column
        prop="type"
        label="类型"
        :filters="[{ text: '折扣', value: false },{ text: '减免', value: true }]"
        :filter-method="filterStatus"
      >
        <template slot-scope="scope">
          <el-tag
            :type="typeCheck(scope.row.type)"
            disable-transitions
            v-html="typeFormatter(scope,scope.row.type)"
          ></el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="needCost" label="满足条件"></el-table-column>
      <el-table-column prop="amount" label="减免金额" :formatter="amountFormatter"></el-table-column>
      <el-table-column prop="discount" label="折扣" :formatter="discountFormatter"></el-table-column>
      <el-table-column prop="num" label="数量"></el-table-column>
      <el-table-column prop="saleable" label="上/下架">
        <template scope="scope">
          <el-switch
            on-text="有效"
            off-text="无效"
            active-color="#13ce66"
            inactive-color="#ff4949"
            v-model="scope.row.status"
            @change="changeCouponsStatus(scope.$index,scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column sortable="custom" prop="create_time" label="更新时间" width="100"></el-table-column>
      <el-table-column sortable="custom" prop="begin_time" label="生效时间" width="100"></el-table-column>
      <el-table-column sortable="custom" prop="end_time" label="失效时间" width="100"></el-table-column>

      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
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
        <el-form-item v-if="false" label="ID" prop="id">
          <el-input v-model="editForm.id" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item v-if="false" label="restaurantId" prop="id">
          <el-input v-model="editForm.restaurantId" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="editForm.name" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="editForm.description"></el-input>
        </el-form-item>
        <el-form-item label="店铺选择">
          <el-select v-model="editForm.restaurantId" placeholder="请选择活动区域">
            <el-option
              v-for="item in restaurants"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-switch active-text="减免" inactive-text="折扣" v-model="editForm.type"></el-switch>
        </el-form-item>
        <el-form-item label="条件" prop="needCost">
          <el-input-number v-model="editForm.needCost" :step="10" :precision="2" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item v-if="editForm.type" label="减免金额" prop="amount">
          <el-input-number v-model="editForm.amount" :step="10" :precision="2" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item v-if="!editForm.type" label="折扣" prop="discount">
          <el-input-number
            v-model="editForm.discount"
            :step="10"
            :precision="2"
            :min="0"
            :max="100"
          ></el-input-number>
        </el-form-item>
        <el-form-item label="数量" prop="num">
          <el-input-number v-model="editForm.num" :step="10" :precision="2" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="生效时间" prop="beginTime">
          <el-date-picker
            type="date"
            placeholder="选择日期"
            v-model="editForm.beginTime"
            style="width: 100%;"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="失效时间" prop="endTime">
          <el-date-picker
            type="date"
            placeholder="选择日期"
            v-model="editForm.endTime"
            style="width: 100%;"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
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
import { getRestaurantNodes } from "@/api/dishMenu";
import {
  getCouponsData,
  changeStatus,
  editCoupon,
  addCoupon,
  removeCoupon,
  batchRemoveCoupons
} from "@/api/coupon";
import QS from "qs";
import { Message, MessageBox } from "element-ui";

export default {
  name: "CouponManage",
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
        name: "",
        restaurantId: null,
        needCost: null,
        beginTime: null,
        endTime: null
      },
      key: "",
      coupons: [],
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
        name: "",
        restaurantId: 0,
        type: null,
        needCost: 0,
        description: "",
        amount: null,
        discount: null,
        num: 0,
        status: null,
        beginTime: null,
        endTime: null
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
    // 菜品上下架
    changeCouponsStatus(index, row) {
      changeStatus(row.id);
    },
    amountFormatter(row, column) {
      if (row.type) {
        return row.amount;
      } else {
        return "折扣类型";
      }
    },
    discountFormatter(row, column) {
      if (row.type) {
        return "满减类型";
      } else {
        return row.discount / 100;
      }
    },
    typeCheck(status) {
      if (status) {
        return "success";
      } else {
        return "danger";
      }
    },
    typeFormatter(scope, val) {
      if (val) {
        return "满减";
      } else {
        return "折扣";
      }
    },
    selectResturant(restaurantId) {
      this.filters.restaurantId = restaurantId;
      this.getCoupons();
    },
    filterStatus(value, row) {
      return row.status === value;
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
      this.getCoupons();
    },
    // 处理filters的数据
    checkObj(para) {
      console.log("点击的时间为:" + this.timeS);
      this.filters.beginTime = this.timeS[0];
      this.filters.endTime = this.timeS[1];
      para.key = JSON.stringify(this.filters);
      getCouponsData(para)
        .then(res => {
          let restaurantId = this.filters.restaurantId;
          this.total = res.total;
          this.totalPage = res.totalPage;
          this.coupons = res.items;
          this.loading = false;
          this.filters = {};
          this.filters.restaurantId = restaurantId;
          this.timeS = [];
        })
        .catch();
    },
    // 获取用户列表
    getCoupons() {
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
          removeCoupon(row.id).then(res => {
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getCoupons();
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
        name: "",
        restaurantId: 0,
        type: null,
        needCost: 0,
        description: "",
        amount: null,
        discount: null,
        num: 0,
        status: null,
        beginTime: null,
        endTime: null
      };
    },
    // 编辑
    updateData() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {})
            .then(() => {
                if (this.editForm.type) {
                this.editForm.discount = 100;
              } else {
                this.editForm.amount = 0;
              }
              const para = Object.assign({}, this.editForm);
              editCoupon(para).then(res => {
                this.$message({
                  message: "提交成功",
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.dialogFormVisible = false;
                this.selectedOptions = [];
                this.getCoupons();
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
              if (this.editForm.type) {
                this.editForm.discount = 100;
              } else {
                this.editForm.amount = 0;
              }
              const para = Object.assign({}, this.editForm);
              console.log(para);
              addCoupon(para).then(res => {
                this.$message({
                  message: "提交成功",
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.dialogFormVisible = false;
                this.getCoupons();
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
          batchRemoveCoupons(para).then(res => {
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getCoupons();
          });
        })
        .catch(() => {});
    },
    // 排序
    handleSortChange(column) {
      this.sortBy = column.prop;
      this.desc = column.order === "ascending";
      this.getCoupons();
    }
  },
  created() {},
  mounted() {
    this.getRestaurants();
    Message({
      message: "请先选择餐厅",
      type: "warning",
      duration: 5 * 1000
    });
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
</style>
