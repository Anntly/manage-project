<template>
  <section class="app-container">
    <el-table :data="formatData" :row-style="showRow" v-bind="$attrs">
      <el-table-column v-if="columns.length===0" width="150">
        <template slot-scope="scope">
          <span v-for="space in scope.row._level" class="ms-tree-space" :key="space"></span>
          <span
            class="tree-ctrl"
            v-if="iconShow(0,scope.row)"
            @click="toggleExpanded(scope.$index)"
          >
            <i v-if="!scope.row._expanded" class="el-icon-plus"></i>
            <i v-else class="el-icon-minus"></i>
          </span>
          {{scope.$index}}
        </template>
      </el-table-column>
      <el-table-column
        v-else
        v-for="(column, index) in columns"
        :key="column.value"
        :label="column.text"
        :width="column.width"
      >
        <template slot-scope="scope">
          <span
            v-if="index === 0"
            v-for="space in scope.row._level"
            class="ms-tree-space"
            :key="space"
          ></span>
          <span
            class="tree-ctrl"
            v-if="iconShow(index,scope.row)"
            @click="toggleExpanded(scope.$index)"
          >
            <i v-if="!scope.row._expanded" class="el-icon-plus"></i>
            <i v-else class="el-icon-minus"></i>
          </span>
          {{scope.row[column.value]}}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="230" fixed="right">
        <template slot-scope="scope">
          <el-button size="small" @click="handleAdd(scope.$index, scope.row)">新增</el-button>
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
      <slot></slot>
    </el-table>
    <!--编辑界面-->
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
        <el-form-item label="ID" prop="id">
          <el-input v-model="editForm.id" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="PID" prop="pid">
          <el-input v-model="editForm.pid" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="分类名称">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="排序等级">
          <el-input v-model="editForm.sort"></el-input>
        </el-form-item>
        <el-form-item label="父节点?">
          <el-switch v-model="editForm.isParent"></el-switch>
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
/**
  Auth: Lei.j1ang
  Created: 2018/1/19-13:59
*/
import treeToArray from "./eval";
import { getCategoriesPage, editCategory } from "@/api/category";

export default {
  name: "treeTable",
  props: {
    data: {
      type: [Array, Object],
      required: true
    },
    columns: {
      type: Array,
      default: () => []
    },
    evalFunc: Function,
    evalArgs: Array,
    expandAll: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogStatus: "",
      textMap: {
        update: "Edit",
        create: "Create"
      },
      dialogFormVisible: false,
      editFormRules: {
        name: [{ required: true, message: "请输入菜品名称", trigger: "blur" }]
      },
      // 编辑界面数据
      editForm: {
        id: 0,
        pid: 0,
        name: "",
        sort: 1,
        isParent: false
      },
      addFormVisible: false, // 新增界面是否显示
      addFormRules: {
        name: [{ required: true, message: "请输入姓名", trigger: "blur" }]
      }
    };
  },
  computed: {
    // 格式化数据源
    formatData: function() {
      let tmp;
      if (!Array.isArray(this.data)) {
        tmp = [this.data];
      } else {
        tmp = this.data;
      }
      const func = this.evalFunc || treeToArray;
      const args = this.evalArgs
        ? Array.concat([tmp, this.expandAll], this.evalArgs)
        : [tmp, this.expandAll];
      return func.apply(null, args);
    }
  },
  methods: {
    showRow: function(row) {
      const show = row.row.parent
        ? row.row.parent._expanded && row.row.parent._show
        : true;
      row.row._show = show;
      return show
        ? "animation:treeTableShow 1s;-webkit-animation:treeTableShow 1s;"
        : "display:none;";
    },
    // 切换下级是否展开
    toggleExpanded: function(trIndex) {
      const record = this.formatData[trIndex];
      record._expanded = !record._expanded;
    },
    // 图标显示
    iconShow(index, record) {
      return index === 0 && record.children && record.children.length > 0;
    },
    // 显示编辑界面
    handleEdit(index, row) {
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.editForm = Object.assign({}, row);
    },
    // 显示新增界面
    handleAdd(index, row) {
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.editForm = {
        id: "0",
        name: "",
        sex: 1,
        age: 0,
        birth: "",
        addr: ""
      };
    },
    // 删除
    handleDel(index, row) {
      this.$confirm("确认删除该记录吗?", "提示", {
        type: "warning"
      })
        .then(() => {
          const para = { id: row.id };
          removeFood(para).then(res => {
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getFoods();
          });
        })
        .catch(() => {});
    },
    // 编辑
    updateData() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {})
            .then(() => {
              const para = Object.assign({}, this.editForm);
              // para.birth =
              //   !para.birth || para.birth === ''
              //     ? ''
              //     : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd')
              editCategory(para).then(res => {
                this.$message({
                  message: "提交成功",
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.dialogFormVisible = false;
                this.getFoods();
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
              this.editForm.id = parseInt(Math.random() * 100).toString(); // mock a id
              const para = Object.assign({}, this.editForm);
              console.log(para);

              para.birth =
                // !para.birth || para.birth === ''
                //   ? ''
                //   : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd')
                addFood(para).then(res => {
                  this.$message({
                    message: "提交成功",
                    type: "success"
                  });
                  this.$refs["editForm"].resetFields();
                  this.dialogFormVisible = false;
                  this.getFoods();
                });
            })
            .catch(e => {
              // 打印一下错误
              console.log(e);
            });
        }
      });
    }
  }
};
</script>
<style rel="stylesheet/css">
@keyframes treeTableShow {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@-webkit-keyframes treeTableShow {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>

<style lang="scss" rel="stylesheet/scss" scoped>
$color-blue: #2196f3;
$space-width: 18px;
.ms-tree-space {
  position: relative;
  top: 1px;
  display: inline-block;
  font-style: normal;
  font-weight: 400;
  line-height: 1;
  width: $space-width;
  height: 14px;
  &::before {
    content: "";
  }
}
.processContainer {
  width: 100%;
  height: 100%;
}
table td {
  line-height: 26px;
}

.tree-ctrl {
  position: relative;
  cursor: pointer;
  color: $color-blue;
  margin-left: -$space-width;
}
</style>
